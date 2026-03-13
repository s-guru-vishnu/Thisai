const express = require('express');
const router = express.Router();
const { getLiveWeatherAPI } = require('../controllers/weatherController');

// GET /api/weather/live
router.get('/live', getLiveWeatherAPI);

module.exports = router;
