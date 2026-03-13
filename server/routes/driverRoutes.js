const express = require('express');
const router = express.Router();
const { getDriverParcels, updateParcelStatus, getOptimizedRoute, getDriverLocation, updateLocation } = require('../controllers/driverController');
const { protect, checkLocation } = require('../middleware/authMiddleware');

// Get driver's assigned parcels
router.get('/parcels', protect, getDriverParcels);

// Update parcel status
router.put('/parcels/:id/status', protect, checkLocation, updateParcelStatus);

// Get optimized routing sequence
router.get('/optimized-route/:driverId', getOptimizedRoute);

// Get driver current location
router.get('/location/:driverId', getDriverLocation);

// Update driver current location stream
router.post('/location', updateLocation);

module.exports = router;
