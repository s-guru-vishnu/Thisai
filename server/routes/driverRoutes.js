const express = require('express');
const router = express.Router();
const { getDriverParcels, updateParcelStatus } = require('../controllers/driverController');
const { protect, checkLocation } = require('../middleware/authMiddleware');

// Get driver's assigned parcels
router.get('/parcels', protect, getDriverParcels);

// Update parcel status
router.put('/parcels/:id/status', protect, checkLocation, updateParcelStatus);

module.exports = router;
