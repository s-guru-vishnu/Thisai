// customerParcelController.js (Handles functional customer APIs)
const Parcel = require('../models/Parcel'); // Assuming returning mock data if DB isn't fully structured for this, but using existing parcel schema layout if possible.

const { getLiveWeather } = require('../services/weatherService');
const { calculateDelayInternal } = require('../services/predictionService');
const User = require('../models/User');

const generateTimeline = (parcel) => {
    const timeline = [];
    timeline.push({ 
        title: 'Order Dispatched', 
        time: parcel.createdAt ? new Date(parcel.createdAt).toLocaleTimeString() : 'N/A', 
        completed: true 
    });
    
    // Origin Hub
    timeline.push({ 
        title: `Arrived at ${parcel.originWarehouse?.hub || 'Origin'} Hub`, 
        completed: true 
    });

    // Intermediate Hubs
    if (parcel.intermediateHubs && parcel.intermediateHubs.length > 0) {
        parcel.intermediateHubs.forEach(hub => {
            timeline.push({ 
                title: `Transit: ${hub.hub || hub.city} Hub`, 
                completed: ['In Transit', 'Out For Delivery', 'Delivered'].includes(parcel.status)
            });
        });
    }

    // Destination Hub
    timeline.push({ 
        title: `Arrived at ${parcel.destinationWarehouse?.hub || 'Destination'} Hub`, 
        completed: ['Out For Delivery', 'Delivered'].includes(parcel.status)
    });

    timeline.push({ 
        title: 'Out For Delivery', 
        time: '', 
        completed: ['Out For Delivery', 'Delivered'].includes(parcel.status) 
    });
    
    timeline.push({ 
        title: 'Delivered', 
        time: '', 
        completed: parcel.status === 'Delivered' 
    });

    return timeline;
};



// @desc    Get parcel details by Tracking ID
// @route   GET /api/parcel/:trackingId
// @access  Private
const getParcelByTrackingId = async (req, res) => {
    try {
        const { trackingId } = req.params;
        // In reality: await Parcel.findOne({ trackingCode: trackingId })
        // Returning mock structure as defined in instructions for immediate frontend integration testing
        
        let parcel = await Parcel.findOne({ 
            $or: [{ trackingCode: trackingId }, { parcelId: trackingId }] 
        })
        .populate('assignedDriver')
        .populate('originWarehouse')
        .populate('destinationWarehouse')
        .populate('intermediateHubs')
        .populate('currentWarehouse');
        
        if (!parcel) {
            // Mock failover if actual DB record doesn't exist yet but UI needs testing
             return res.json({
                trackingId: trackingId,
                productName: "Logistics Package",
                senderName: "Warehouse Alpha",
                pickupLocation: "Central Hub",
                deliveryAddress: "Customer Location",
                eta: "15 min",
                driverName: "John Doe",
                status: "In Transit",
                driverLocation: { lat: 13.0827, lng: 80.2707 }, // default chennai
                timeline: [
                   { title: 'Order Created', time: '10:00 AM', completed: true },
                   { title: 'Package Picked Up', time: '11:30 AM', completed: true },
                   { title: 'In Transit', time: '12:00 PM', completed: true },
                   { title: 'Out For Delivery', time: '', completed: false },
                   { title: 'Delivered', time: '', completed: false }
                ]
            });
        }

        // Construct Dynamic Timeline
        const timeline = generateTimeline(parcel);
        const prediction = await calculateDelayInternal(parcel);

        res.json({
            trackingId: parcel.parcelId || parcel.trackingCode,
            productName: parcel.productName || 'Package',
            senderName: parcel.seller || 'Seller',
            pickupLocation: parcel.originWarehouse?.name || 'Origin Hub',
            deliveryAddress: parcel.deliveryAddress,
            eta: prediction.eta,
            delayMinutes: prediction.delayMinutes,
            delayRisk: prediction.delayRisk,
            reason: prediction.reason,
            status: parcel.status,
            driverName: parcel.assignedDriver ? parcel.assignedDriver.name : 'Unassigned',
            driverLocation: parcel.currentLocation || { lat: 13.0827, lng: 80.2707 },
            timeline: timeline,
            prediction: prediction
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's parcel history
// @route   GET /api/parcel/history/:userId
// @access  Private
const getUserParcelHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await Parcel.find({ 
            customer: userId, 
            status: 'Delivered' 
        }).populate('assignedDriver');
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live driver location for a tracking ID
// @route   GET /api/parcel/live-location/:trackingId
// @access  Private
const getLiveDriverLocation = async (req, res) => {
    try {
        // Mock jitter for the UI polling
        const latOffset = (Math.random() - 0.5) * 0.005;
        const lngOffset = (Math.random() - 0.5) * 0.005;

        res.json({
            driverLocation: {
                lat: 13.0827 + latOffset,
                lng: 80.2707 + lngOffset
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI Prediction for delay (Using Real-Time Live Routing logic)
// @route   GET /api/predict/delay/:trackingId
// @access  Private
const getDelayPrediction = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const parcel = await Parcel.findOne({ trackingCode: trackingId });
        
        const prediction = await calculateDelayInternal(parcel);
        res.json(prediction);
    } catch (error) {
        console.error('Route scoring error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dynamic notifications for customer
// @route   GET /api/parcel/notifications
// @access  Private
const getCustomerNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const parcels = await Parcel.find({ customer: userId });
        const notifications = [];
        
        parcels.forEach((parcel, index) => {
            if (parcel.status === 'Delivered') {
                notifications.push({
                    id: parcel._id ? parcel._id.toString() + '_del' : index + '_del',
                    title: 'Package Delivered',
                    message: `Your package (Code: ${parcel.trackingCode}) has been delivered.`,
                    type: 'success',
                    time: parcel.updatedAt ? new Date(parcel.updatedAt).toLocaleTimeString() : 'Recently'
                });
            } else if (parcel.status === 'Out For Delivery' || parcel.status === 'In Transit') {
                notifications.push({
                    id: parcel._id ? parcel._id.toString() + '_trans' : index + '_trans',
                    title: 'Driver Approaching',
                    message: `Driver for package (Code: ${parcel.trackingCode}) is approximately 15 mins away from your location.`,
                    type: 'warning',
                    time: '10 mins ago'
                });
            } else {
                notifications.push({
                    id: parcel._id ? parcel._id.toString() + '_pick' : index + '_pick',
                    title: 'Package Picked Up',
                    message: `Your package (Code: ${parcel.trackingCode}) has been picked up from the warehouse.`,
                    type: 'info',
                    time: '2 hours ago'
                });
            }
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active (latest non-delivered) shipment for customer
// @route   GET /api/parcel/active
// @access  Private
const getActiveShipment = async (req, res) => {
    try {
        const userId = req.user._id;
        const parcel = await Parcel.findOne({
            customer: userId,
            status: { $ne: 'Delivered' }
        }).sort({ createdAt: -1 })
        .populate('assignedDriver')
        .populate('originWarehouse', 'name hub region')
        .populate('destinationWarehouse', 'name hub region')
        .populate('intermediateHubs', 'name hub region');

        if (!parcel) {
            return res.json(null);
        }

        const prediction = await calculateDelayInternal(parcel);

        res.json({
            trackingId: parcel.parcelId,
            productName: parcel.productName,
            status: parcel.status,
            eta: prediction.eta,
            delayMinutes: prediction.delayMinutes,
            delayRisk: prediction.delayRisk,
            reason: prediction.reason,
            driverName: parcel.assignedDriver ? parcel.assignedDriver.name : 'Unassigned',
            timeline: generateTimeline(parcel),
            logisticsPath: {
                origin: parcel.originWarehouse?.name || 'Local Pickup',
                destination: parcel.destinationWarehouse?.name || 'Final Delivery Hub',
                hubs: parcel.intermediateHubs?.map(h => h.name) || [],
                fullRoute: [
                    parcel.originWarehouse?.name,
                    ...(parcel.intermediateHubs?.map(h => h.name) || []),
                    parcel.destinationWarehouse?.name
                ].filter(Boolean)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getParcelByTrackingId,
    getUserParcelHistory,
    getLiveDriverLocation,
    getDelayPrediction,
    getCustomerNotifications,
    getActiveShipment
};
