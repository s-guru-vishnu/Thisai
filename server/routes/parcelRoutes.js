const express = require('express');
const router = express.Router();
const { getParcelByTrackingId, getUserParcelHistory, getLiveDriverLocation, getCustomerNotifications, getActiveShipment } = require('../controllers/customerParcelController');
const { protect, checkLocation } = require('../middleware/authMiddleware');

router.get('/notifications', protect, getCustomerNotifications);
router.get('/active', protect, getActiveShipment);

router.get('/:trackingId', protect, getParcelByTrackingId);

router.get('/history/:userId', protect, checkLocation, getUserParcelHistory);

router.get('/live-location/:trackingId', protect, getLiveDriverLocation);

module.exports = router;
