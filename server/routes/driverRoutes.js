const express = require('express');
const router = express.Router();
const {
    getDriverParcels,
    updateParcelStatus,
    updateDriverLocation,
    getDriverRoute,
    getOptimizedRoute,
    getDriverLocation,
    updateLocation
} = require('../controllers/driverController');
const { protect, authorize, checkLocation } = require('../middleware/authMiddleware');

// Get driver's assigned parcels
router.get('/parcels', protect, authorize('driver'), getDriverParcels);

// Update parcel status
router.put('/parcels/:id/status', protect, authorize('driver'), checkLocation, updateParcelStatus);

// Update driver location (telemetry)
router.post('/telemetry', protect, authorize('driver'), updateLocation);

// Get real-time route optimization data
router.get('/route/:id', protect, getDriverRoute);

// Get optimized routing sequence
router.get('/optimized-route/:driverId', protect, getOptimizedRoute);

// Get driver current location
router.get('/location/:driverId', protect, getDriverLocation);

module.exports = router;
