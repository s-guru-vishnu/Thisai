const express = require('express');
const router = express.Router();
const { getWarehouseParcels, updateParcelWarehouse, getWarehouse } = require('../controllers/warehouseController');
const { protect, checkLocation } = require('../middleware/authMiddleware');

// Get warehouse parcels
router.get('/parcels', protect, getWarehouseParcels);

// Update parcel warehouse
router.put('/parcels/:id', protect, checkLocation, updateParcelWarehouse);

// Get warehouse info
router.get('/', getWarehouse);

module.exports = router;
