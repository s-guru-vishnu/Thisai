const express = require('express');
const router = express.Router();
const { getDriverParcels, updateParcelStatus, getOptimizedRoute } = require('../controllers/driverController');

// Get driver's assigned parcels
router.get('/parcels', getDriverParcels);

// Update parcel status
router.put('/parcels/:id/status', updateParcelStatus);

// Get optimized routing sequence
router.get('/optimized-route/:driverId', getOptimizedRoute);

module.exports = router;
