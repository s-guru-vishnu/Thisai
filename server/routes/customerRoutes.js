const express = require('express');
const router = express.Router();
const { 
    getParcelByTrackingId, 
    getUserParcelHistory, 
    getLiveDriverLocation, 
    getDelayPrediction,
    getCustomerNotifications
} = require('../controllers/customerParcelController');
const { protect } = require('../middleware/authMiddleware');

// Get parcel details by Tracking ID
router.get('/:trackingId', getParcelByTrackingId);

// Get user's parcel history
router.get('/history/:userId', protect, getUserParcelHistory);

// Get live driver location
router.get('/live-location/:trackingId', protect, getLiveDriverLocation);

// Get AI Prediction for delay
router.get('/predict/:trackingId', protect, getDelayPrediction);

// Get customer notifications
router.get('/notifications', protect, getCustomerNotifications);

module.exports = router;
