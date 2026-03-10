const express = require('express');
const router = express.Router();
const { assignDriver, getDrivers, getWarehouseParcels } = require('../controllers/managerController');

// Assign driver to parcel
router.put('/parcels/:id/assign', assignDriver);

// Get all drivers
router.get('/drivers', getDrivers);

// Get warehouse parcels
router.get('/warehouses/:id/parcels', getWarehouseParcels);

module.exports = router;
