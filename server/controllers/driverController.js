const Parcel = require('../models/Parcel');
const { calculatePickupRoute, getCachedOrComputeRoute, smoothETA, filterGPSDrift } = require('../services/routingEngine');

// @desc    Get driver's assigned parcels
// @route   GET /api/driver/parcels
// @access  Private/Driver
const getDriverParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ assignedDriver: req.user._id });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update parcel status
// @route   PUT /api/driver/parcels/:id/status
// @access  Private/Driver
const updateParcelStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const parcel = await Parcel.findOne({ _id: req.params.id, assignedDriver: req.user._id });
        if (parcel) {
            parcel.status = status;
            const updatedParcel = await parcel.save();
            res.json(updatedParcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Optimized Route for Driver
// @route   GET /api/driver/optimized-route/:driverId
// @access  Private/Driver
const getOptimizedRoute = async (req, res) => {
    try {
        const driverId = req.params.driverId;
        
        // 1. Fetch assigned parcels logically
        const parcels = await Parcel.find({ assignedDriver: driverId, status: { $ne: 'Delivered' } }).populate('warehouse');
        
        if (!parcels || parcels.length === 0) {
            return res.json({ message: "No active parcels assigned." });
        }

        // Setup mock locations based on database (would use actual GPS ping from app normally)
        const currentLoc = { lat: 13.0827, lng: 80.2707 }; // Chennai Central mock
        
        // Assuming all parcels originate from the same warehouse for this driver's current run
        const warehouse = parcels[0].warehouse;
        // Mock warehouse location or extract if warehouse model was populated with geo
        const warehouseLoc = { lat: 12.9897, lng: 80.2458 }; // TIDEL mock

        // Stage 8: GPS Drift Filter (mocking old val vs new)
        const smoothedLoc = filterGPSDrift(currentLoc, currentLoc); // Pass live coords here normally
        
        // 2. Stage 2: Calculate Pickup Route
        const pickupRouteInfo = await calculatePickupRoute(smoothedLoc, warehouseLoc);
        
        if (pickupRouteInfo.isUnsafe) {
            return res.status(403).json({ message: "EXTREME Weather: Route Blocked", activeAlerts: ["⚠ EXTREME WEATHER - SHELTER IN PLACE"] });
        }

        // Format stops array for heuristic algorithm
        const stopsArr = parcels.map((p, idx) => {
            return {
                id: p._id,
                trackingCode: p.parcelId,
                productName: p.productName,
                status: p.status, // Pass real lifecycle status
                priority: p.category === 'Electronics' ? 'Urgent' : 'Normal', 
                location: { lat: 13.0 + (Math.random() * 0.1), lng: 80.2 + (Math.random() * 0.1) },
                serviceDurationMinutes: p.category === 'Electronics' ? 10 : 5 // heavier items take longer to drop
            };
        });

        // 3. Stage 4 & 5 & 11: Cached Smart Sequence
        const sequenceData = await getCachedOrComputeRoute(driverId, warehouseLoc, stopsArr);

        // Calculate expected ETA cascade (Stage 3 & 7)
        let runningMinutes = pickupRouteInfo.travelTimeMins;

        const estimatedArrivalTimes = sequenceData.sequence.map((stop, i) => {
            // Stage 7: Add travel to next stop + service time
            // For mock, just assuming 5 min travel between local nodes
            runningMinutes += 5 + (stop.serviceDurationMinutes || 5);
            
            // Stage 3: Smooth ETA UI jumpiness
            const smoothedMins = smoothETA(stop.id, runningMinutes);
            
            let etaMarker = new Date();
            etaMarker.setMinutes(etaMarker.getMinutes() + smoothedMins);
            
            return {
                stopId: stop.id,
                eta: new Date(etaMarker).toLocaleTimeString(),
                status: stop.status
            };
        });

        const activeAlerts = [];
        if (pickupRouteInfo.weatherRiskLevel > 1.0) activeAlerts.push(`Weather Risk: ${pickupRouteInfo.riskLevelStr}`);
        if (pickupRouteInfo.travelTimeMins > 45) activeAlerts.push('Heavy traffic delays ahead');

        res.json({
            pickupRouteScore: pickupRouteInfo,
            optimizedStopSequence: sequenceData.sequence,
            estimatedArrivalTimes,
            trafficAlerts: activeAlerts
        });

    } catch (error) {
        console.error("Optimization err:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDriverParcels, updateParcelStatus, getOptimizedRoute };
