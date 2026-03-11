const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getDriverParcels, updateParcelStatus, getOptimizedRoute } = require('../controllers/driverController');
=======
const { getDriverParcels, updateParcelStatus } = require('../controllers/driverController');
const { protect, checkLocation } = require('../middleware/authMiddleware');
>>>>>>> 2b4e5cdf2178a0f91a2e4a5c8bb4bd1a1b7660a0

// Get driver's assigned parcels
router.get('/parcels', protect, getDriverParcels);

// Update parcel status
router.put('/parcels/:id/status', protect, checkLocation, updateParcelStatus);

// Get optimized routing sequence
router.get('/optimized-route/:driverId', getOptimizedRoute);

module.exports = router;
