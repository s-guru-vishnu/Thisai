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

// @desc    Get Driver Location
const getDriverLocation = async (req, res) => {
    try {
        const d = await User.findById(req.params.driverId);
        res.json({ location: { lat: d?.location?.latitude, lng: d?.location?.longitude } });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { 
    getOptimizedRoute, 
    updateLocation, 
    getDriverParcels, 
    updateParcelStatus, 
    getDriverLocation 
};


