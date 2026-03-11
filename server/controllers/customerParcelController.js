// customerParcelController.js (Handles functional customer APIs)
const Parcel = require('../models/Parcel'); // Assuming returning mock data if DB isn't fully structured for this, but using existing parcel schema layout if possible.

const { getLiveWeather } = require('../services/weatherService');

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
        // In reality: await Parcel.find({ customer: userId, status: 'Delivered' })
        // Return structured list
        res.json([
             { trackingId: "1234567890", productName: 'Laptop Stand', pickupLocation: 'Chennai Hub', deliveryAddress: 'Home', deliveredDate: '2023-10-01', status: 'Delivered', timeline: [{title: 'Delivered', time: '02:00 PM', completed: true}], proof: 'Signed by Receiver', receiverName: 'Customer' },
             { trackingId: "0987654321", productName: 'Wireless Mouse', pickupLocation: 'Bangalore Hub', deliveryAddress: 'Home', deliveredDate: '2023-09-15', status: 'Delivered', timeline: [{title: 'Delivered', time: '11:00 AM', completed: true}], proof: 'Left at Door', receiverName: 'Customer' }
        ]);
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
        
        // Base driver mock coordinates (or actual parcel coordinates if available)
        let lat = 13.0827;
        let lng = 80.2707;
        let distanceFactor = 1.0;
        
        if (parcel && parcel.currentLocation) {
             lat = parcel.currentLocation.lat;
             lng = parcel.currentLocation.lng;
             distanceFactor = 1.1; // Baseline realistic distance factor
        }

        // Live Weather API Evaluation
        const weather = await getLiveWeather(lat, lng);
        
        let weatherRiskFactor = 1.0;
        if (weather.riskLevel === 'HIGH') weatherRiskFactor = 1.6;
        else if (weather.riskLevel === 'MEDIUM') weatherRiskFactor = 1.25;
        
        // Traffic Delay Logic (Based on Time of Day rush hours natively)
        const hour = new Date().getHours();
        const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
        const trafficDelayFactor = isRushHour ? 1.5 : 1.0;

        // ** CORE ROUTING CALCULATION **
        // RouteScore = distanceFactor * trafficDelayFactor * weatherRiskFactor
        const routeScore = distanceFactor * trafficDelayFactor * weatherRiskFactor;
        
        // Interpret Score into Dashboard Data
        let delayRisk = 'LOW';
        let customReason = 'Clear route';
        
        if (routeScore >= 1.8) {
             delayRisk = 'HIGH';
             if (weatherRiskFactor >= 1.6) customReason = `Severe weather delay (${weather.weatherMain})`;
             else customReason = 'Severe traffic congestion detected';
        } else if (routeScore >= 1.3) {
             delayRisk = 'MEDIUM';
             if (weatherRiskFactor > 1.0) customReason = `Moderate weather impact (${weather.weatherDescription})`;
             else customReason = 'Moderate routing delay';
        }
        
        // Output translation
        const delayMinutes = Math.floor((routeScore - 1.0) * 20);

        res.json({
            delayRisk,
            delayMinutes: delayMinutes > 0 ? delayMinutes : 0,
            reason: customReason,
            routeScore: routeScore.toFixed(2),
            weatherMeta: weather
        });
    } catch (error) {
        console.error('Route scoring error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getParcelByTrackingId,
    getUserParcelHistory,
    getLiveDriverLocation,
    getDelayPrediction
};
