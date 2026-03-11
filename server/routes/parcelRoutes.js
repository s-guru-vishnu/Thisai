const express = require('express');
const router = express.Router();
const { getParcelByTrackingId, getUserParcelHistory, getLiveDriverLocation } = require('../controllers/customerParcelController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:trackingId', protect, getParcelByTrackingId);

router.get('/history/:userId', protect, getUserParcelHistory);

router.get('/live-location/:trackingId', protect, getLiveDriverLocation);

module.exports = router;
