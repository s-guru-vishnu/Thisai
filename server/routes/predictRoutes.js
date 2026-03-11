const express = require('express');
const router = express.Router();
const { getDelayPrediction } = require('../controllers/customerParcelController');
const { protect } = require('../middleware/authMiddleware');

// Get AI delay prediction
router.get('/delay/:trackingId', protect, getDelayPrediction);

module.exports = router;
