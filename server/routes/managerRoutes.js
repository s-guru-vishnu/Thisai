const express = require('express');
const router = express.Router();
const { assignDriver, getDrivers, getWarehouseParcels } = require('../controllers/managerController');
const { protect, checkLocation } = require('../middleware/authMiddleware');

// Assign driver to parcel
router.put('/parcels/:id/assign', protect, checkLocation, assignDriver);

// Get all drivers
router.get('/drivers', getDrivers);

// Get warehouse parcels
router.get('/warehouses/:id/parcels', getWarehouseParcels);

module.exports = router;
