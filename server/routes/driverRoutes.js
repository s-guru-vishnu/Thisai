const express = require('express');
const router = express.Router();
const {
    getDriverParcels,
    updateParcelStatus,
    updateDriverLocation,
    getDriverRoute
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get driver's assigned parcels
router.get('/parcels', protect, authorize('driver'), getDriverParcels);

// Update parcel status
router.put('/parcels/:id/status', protect, authorize('driver'), updateParcelStatus);

// Update driver location (telemetry)
router.post('/location', protect, authorize('driver'), updateDriverLocation);

// Get real-time route optimization data
router.get('/route/:id', protect, getDriverRoute);

module.exports = router;
