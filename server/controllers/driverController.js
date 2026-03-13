const Parcel = require('../models/Parcel');
const { 
    calculatePickupRoute, 
    getCachedOrComputeRoute, 
    getSmoothedETA, 
    filterGPSDrift,
    formatDuration 
} = require('../services/routingEngine');
const { trackDriverLocation, getDriverStats } = require('../services/dynamicSpeedService');
const User = require('../models/User');

// @desc    Update driver location stream
const updateLocation = async (req, res) => {
    try {
        const { driverId, lat, lng, timestamp } = req.body;
        if (!driverId || lat === undefined || lng === undefined) {
            return res.status(400).json({ message: "Invalid payload." });
        }
        trackDriverLocation(driverId, lat, lng, timestamp);
        await User.findByIdAndUpdate(driverId, {
            'location.latitude': lat,
            'location.longitude': lng
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Optimized Route for Driver
const getOptimizedRoute = async (req, res) => {
    try {
        const driverId = req.params.driverId;
        const parcels = await Parcel.find({ 
            assignedDriver: driverId, 
            status: { $ne: 'Delivered' } 
        }).populate('warehouse');
        
        if (!parcels || parcels.length === 0) {
            return res.json({ message: "No active tasks." });
        }

        const driver = await User.findById(driverId);
        if (!driver || !driver.location.latitude) {
            return res.status(400).json({ message: "Driver location unavailable." });
        }

        const driverStats = getDriverStats(driverId);
        const currentLoc = { lat: driver.location.latitude, lng: driver.location.longitude };
        
        // 1. PHASE DETECTION
        const hasUnpicked = parcels.some(p => ['Received', 'Processed'].includes(p.status));
        const routingPhase = hasUnpicked ? "PICKUP" : "DELIVERY";

        const warehouse = parcels[0].warehouse;
        const warehouseLoc = { lat: warehouse.latitude, lng: warehouse.longitude };

        const stopsArr = parcels.map(p => ({
            id: p._id,
            trackingCode: p.parcelId,
            status: p.status,
            priority: p.category === 'Electronics' ? 'Urgent' : 'Normal', 
            location: { lat: p.latitude, lng: p.longitude },
            addressLabel: p.deliveryAddress,
            productName: p.productName
        }));

        // 2. SEQUENCE & SEGMENT CALCULATION
        const sequenceData = await getCachedOrComputeRoute(driverId, warehouseLoc, stopsArr, driverStats);

        let finalETA = "-";
        let targetLabel = "";

        if (routingPhase === "PICKUP") {
            const pickupInfo = await calculatePickupRoute(currentLoc, warehouseLoc, driverStats);
            const smoothedMins = getSmoothedETA(driverId, pickupInfo.travelTimeMins);
            finalETA = formatDuration(smoothedMins);
            targetLabel = "TO WAREHOUSE";
        } else {
            // Target is first stop in optimized sequence
            const nextStop = sequenceData.sequence[0];
            const routeToNext = await calculatePickupRoute(currentLoc, nextStop.location, driverStats);
            const smoothedMins = getSmoothedETA(driverId, routeToNext.travelTimeMins);
            finalETA = formatDuration(smoothedMins);
            targetLabel = nextStop.addressLabel?.split(',')[0] || "NEXT STOP";
        }

        res.json({
            optimizedStopSequence: sequenceData.sequence.map(s => ({
                ...s,
                formattedLegTime: formatDuration(s.legDurationMins)
            })),
            routingPhase,
            targetLabel,
            nextActionETA: driverStats.status === 'NOT_STARTED' ? "-" : finalETA,
            liveSpeed: driverStats.avgSpeed,
            driverStatus: driverStats.status,
            heading: driverStats.heading,
            warehouseLocation: warehouseLoc,
            driverLocation: currentLoc,
            warehouseAddress: warehouse.location,
            warehouseName: warehouse.name,
            driverName: driver.name
        });

    } catch (error) {
        console.error("Optimization err:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver's assigned parcels
const getDriverParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ assignedDriver: req.user?._id || req.params.driverId });
        res.json(parcels);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update parcel status
const updateParcelStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            parcel.status = status;
            const updatedParcel = await parcel.save();
            res.json(updatedParcel);
        } else { res.status(404).json({ message: 'Parcel not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update driver location
// @route   POST /api/driver/location
// @access  Private/Driver
const updateDriverLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        // In a real app, we'd store this in the User model or a dedicated DriverStatus model
        // For now, let's just confirm receipt to keep the frontend happy
        res.json({ message: 'Location updated', location: { lat, lng } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver real-time route (Mock for dashboard)
// @route   GET /api/driver/route/:id
// @access  Private
const getDriverRoute = async (req, res) => {
    try {
        // Return structured stops for the map
        const parcels = await Parcel.find({ assignedDriver: req.params.id });
        const stops = parcels.map(p => ({
            id: p._id,
            trackingCode: p.trackingCode || p.parcelId,
            productName: p.productName,
            destination: p.deliveryAddress,
            location: { lat: 13.0827 + (Math.random() - 0.5) * 0.1, lng: 80.2707 + (Math.random() - 0.5) * 0.1 } // Mock coordinates around Chennai
        }));
        res.json({ stops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDriverParcels, updateParcelStatus, updateDriverLocation, getDriverRoute };
