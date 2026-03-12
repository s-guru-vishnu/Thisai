// customerParcelController.js (Handles functional customer APIs)
const Parcel = require('../models/Parcel'); // Assuming returning mock data if DB isn't fully structured for this, but using existing parcel schema layout if possible.

// Helper to simulate delay prediction logic
const generateAIPrediction = (trackingId) => {
    // Deterministic mock based on tracking string
    const codeVal = trackingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
    const reasons = ['Traffic congestion', 'Weather conditions', 'High volume routing', 'Driver delay', 'Clear route'];
    
    return {
        delayRisk: riskLevels[codeVal % 3],
        delayMinutes: (codeVal % 3) * 15 + (codeVal % 10),
        reason: reasons[codeVal % 5]
    };
};

// @desc    Get parcel details by Tracking ID
// @route   GET /api/parcel/:trackingId
// @access  Private
const getParcelByTrackingId = async (req, res) => {
    try {
        const { trackingId } = req.params;
        // In reality: await Parcel.findOne({ trackingCode: trackingId })
        // Returning mock structure as defined in instructions for immediate frontend integration testing
        
        let parcel = await Parcel.findOne({ trackingCode: trackingId }).populate('driver');
        
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

        res.json({
            trackingId: parcel.trackingCode,
            productName: parcel.productName || 'Package',
            senderName: parcel.sender || 'Sender Name',
            pickupLocation: parcel.pickupAddress || 'Warehouse',
            deliveryAddress: parcel.deliveryAddress,
            eta: "15 min",
            status: parcel.status,
            driverName: parcel.driver ? parcel.driver.name : 'Unassigned',
            driverLocation: parcel.currentLocation || { lat: 13.0827, lng: 80.2707 },
            timeline: [
                { title: 'Order Created', time: '10:00 AM', completed: true },
                { title: 'Package Picked Up', time: '11:30 AM', completed: ['Picked Up', 'In Transit', 'Out For Delivery', 'Delivered'].includes(parcel.status) },
                { title: 'In Transit', time: '12:00 PM', completed: ['In Transit', 'Out For Delivery', 'Delivered'].includes(parcel.status) },
                { title: 'Out For Delivery', time: '', completed: ['Out For Delivery', 'Delivered'].includes(parcel.status) },
                { title: 'Delivered', time: '', completed: parcel.status === 'Delivered' }
             ]
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
            $or: [{ customer: userId }, { receiver: userId }], 
            status: 'Delivered' 
        }).populate('driver');
        
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

// @desc    Get AI Prediction for delay
// @route   GET /api/predict/delay/:trackingId
// @access  Private
const getDelayPrediction = async (req, res) => {
    try {
        const prediction = generateAIPrediction(req.params.trackingId);
        res.json(prediction);
    } catch (error) {
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

module.exports = {
    getParcelByTrackingId,
    getUserParcelHistory,
    getLiveDriverLocation,
    getDelayPrediction,
    getCustomerNotifications
};
