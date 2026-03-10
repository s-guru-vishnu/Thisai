const express = require('express');
const router = express.Router();
const { getDriverParcels, updateParcelStatus } = require('../controllers/driverController');

// Get driver's assigned parcels
router.get('/parcels', getDriverParcels);

// Update parcel status
router.put('/parcels/:id/status', updateParcelStatus);

module.exports = router;
