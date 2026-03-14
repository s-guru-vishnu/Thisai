const Parcel = require('../models/Parcel');
const User = require('../models/User');
const Warehouse = require('../models/Warehouse');

// @desc    Assign driver to parcel
// @route   PUT /api/manager/parcels/:id/assign
// @access  Private/Manager
const assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            parcel.assignedDriver = driverId;
            const updatedParcel = await parcel.save();
            res.json(updatedParcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all drivers (under this manager or unassigned)
// @route   GET /api/manager/drivers
// @access  Private/Manager
const getDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ 
            role: { $in: ['driver', 'cargo_driver', 'delivery_driver'] },
            $or: [
                { assignedManager: req.user._id },
                { assignedManager: { $exists: false } },
                { assignedManager: null }
            ]
        });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign driver to manager's team
// @route   PUT /api/manager/drivers/:driverId/recruit
// @access  Private/Manager
const assignDriverToMyTeam = async (req, res) => {
    try {
        console.log(`Recruit request: Manager ${req.user.email} recruiting driver ${req.params.driverId}`);
        
        const driver = await User.findById(req.params.driverId);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (!['driver', 'cargo_driver', 'delivery_driver'].includes(driver.role)) {
            return res.status(400).json({ message: 'User is not a driver' });
        }

        // Use findByIdAndUpdate to avoid triggering pre-save password hook
        const updatedDriver = await User.findByIdAndUpdate(
            req.params.driverId,
            { assignedManager: req.user._id },
            { new: true }
        ).select('-password');
        
        console.log(`Driver ${updatedDriver.email} assigned to manager ${req.user.email}`);
        res.json({ message: 'Driver assigned to your team', driver: updatedDriver });
    } catch (error) {
        console.error('Recruit error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get warehouse parcels
// @route   GET /api/manager/warehouses/:id/parcels
// @access  Private/Manager
const getWarehouseParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ warehouse: req.params.id });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// FAIR BURDEN DISTRIBUTION — Auto-Assign Algorithm
// ═══════════════════════════════════════════════════════════════
// Fairness Score:  FS_i = α(W_i) + β(B_i)
//   α = 0.7 (current workload weight)  β = 0.3 (historical burden weight)
//   W_i = current # of active parcels assigned to driver i
//   B_i = (driver's total past deliveries) / (fleet average deliveries)
//         B > 1 → over-burdened,  B < 1 → under-utilized
//
// Assignment: iterate unassigned parcels, always give to the driver
//             with the LOWEST Fairness Score (least burdened).
// ═══════════════════════════════════════════════════════════════

// @desc    Auto-assign unassigned parcels to delivery drivers fairly
// @route   POST /api/manager/auto-assign
// @access  Private/Manager
const autoAssignParcels = async (req, res) => {
    try {
        const managerId = req.user._id;

        // 1. Get delivery drivers in this manager's team
        const teamDrivers = await User.find({
            role: { $in: ['driver', 'delivery_driver'] },
            assignedManager: managerId
        });

        if (teamDrivers.length === 0) {
            return res.status(400).json({ 
                message: 'No delivery drivers in your team. Recruit drivers first.' 
            });
        }

        // 2. Get unassigned parcels (no driver assigned, status not Delivered)
        const unassignedParcels = await Parcel.find({
            $or: [
                { assignedDriver: null },
                { assignedDriver: { $exists: false } }
            ],
            status: { $nin: ['Delivered', 'Cancelled'] }
        });

        if (unassignedParcels.length === 0) {
            return res.status(400).json({ 
                message: 'No unassigned parcels to distribute.' 
            });
        }

        // 3. Compute current workload W_i for each driver
        const driverIds = teamDrivers.map(d => d._id);
        const currentAssignments = await Parcel.aggregate([
            { 
                $match: { 
                    assignedDriver: { $in: driverIds },
                    status: { $nin: ['Delivered', 'Cancelled'] }
                } 
            },
            { $group: { _id: '$assignedDriver', count: { $sum: 1 } } }
        ]);
        const currentWorkloadMap = {};
        currentAssignments.forEach(a => { 
            currentWorkloadMap[a._id.toString()] = a.count; 
        });

        // 4. Compute historical burden B_i for each driver
        const historicalAssignments = await Parcel.aggregate([
            { $match: { assignedDriver: { $in: driverIds } } },
            { $group: { _id: '$assignedDriver', totalPast: { $sum: 1 } } }
        ]);
        const historicalMap = {};
        historicalAssignments.forEach(a => { 
            historicalMap[a._id.toString()] = a.totalPast; 
        });
        const totalHistorical = Object.values(historicalMap).reduce((s, v) => s + v, 0);
        const fleetAvg = teamDrivers.length > 0 ? totalHistorical / teamDrivers.length : 1;

        // 5. Build driver fairness profiles
        const ALPHA = 0.7; // current workload weight
        const BETA  = 0.3; // historical burden weight

        const driverProfiles = teamDrivers.map(d => {
            const id = d._id.toString();
            const W_i = currentWorkloadMap[id] || 0;
            const pastLoad = historicalMap[id] || 0;
            const B_i = fleetAvg > 0 ? pastLoad / fleetAvg : 0;
            const FS_i = ALPHA * W_i + BETA * B_i;
            return { 
                driverId: d._id, 
                name: d.name, 
                email: d.email,
                W_i, B_i: parseFloat(B_i.toFixed(2)), 
                FS: parseFloat(FS_i.toFixed(3)),
                assigned: 0 // parcels assigned in this round
            };
        });

        // 6. Assign each parcel to the driver with the lowest FS
        const assignments = [];
        for (const parcel of unassignedParcels) {
            // Sort by current FS (recalculated with in-round additions)
            driverProfiles.sort((a, b) => {
                const fsA = ALPHA * (a.W_i + a.assigned) + BETA * a.B_i;
                const fsB = ALPHA * (b.W_i + b.assigned) + BETA * b.B_i;
                return fsA - fsB;
            });

            const chosen = driverProfiles[0];
            
            // Use findByIdAndUpdate to bypass re-validating the entire document (like required 'customer')
            const updatedParcel = await Parcel.findByIdAndUpdate(
                parcel._id, 
                { 
                    $set: { 
                        assignedDriver: chosen.driverId,
                        status: 'Dispatched'
                    } 
                },
                { new: true } // Return updated document
            );

            if (!updatedParcel) {
                console.error(`Failed to update parcel ${parcel._id}`);
                continue;
            }

            chosen.assigned += 1;
            assignments.push({
                parcelId: parcel.parcelId,
                productName: parcel.productName,
                driverName: chosen.name,
                driverEmail: chosen.email
            });
        }

        // 7. Build summary
        const summary = driverProfiles.map(d => ({
            name: d.name,
            email: d.email,
            previousLoad: d.W_i,
            newAssignments: d.assigned,
            totalActive: d.W_i + d.assigned,
            burdenRatio: d.B_i,
            fairnessScore: parseFloat((ALPHA * (d.W_i + d.assigned) + BETA * d.B_i).toFixed(3))
        }));

        res.json({
            message: `Successfully assigned ${assignments.length} parcels to ${teamDrivers.length} drivers with fair burden distribution.`,
            totalAssigned: assignments.length,
            driverCount: teamDrivers.length,
            fairnessMetrics: {
                algorithm: 'FS_i = α(W_i) + β(B_i)',
                alpha: ALPHA,
                beta: BETA,
                fleetAveragePastLoad: parseFloat(fleetAvg.toFixed(2))
            },
            driverSummary: summary,
            assignments
        });

    } catch (error) {
        console.error('Auto-assign error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { assignDriver, getDrivers, getWarehouseParcels, assignDriverToMyTeam, autoAssignParcels };
