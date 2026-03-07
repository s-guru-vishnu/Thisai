const express = require('express');
const router = express.Router();
const { getWarehouseParcels, updateParcelWarehouse, getWarehouse } = require('../controllers/warehouseController');

// Get warehouse parcels
router.get('/parcels', getWarehouseParcels);

// Update parcel warehouse
router.put('/parcels/:id', updateParcelWarehouse);

// Get warehouse info
router.get('/', getWarehouse);

module.exports = router;
