const express = require('express');
const router = express.Router();
const { assignDriver, getDrivers, getWarehouseParcels, assignDriverToMyTeam, autoAssignParcels } = require('../controllers/managerController');

// Note: protect + authorize('manager') is already applied at mount point in server.js

// Assign driver to parcel
router.put('/parcels/:id/assign', assignDriver);

// Get all drivers (assigned or available)
router.get('/drivers', getDrivers);

// Assign driver to manager's team
router.put('/drivers/:driverId/recruit', assignDriverToMyTeam);

// Auto-assign parcels fairly to delivery drivers
router.post('/auto-assign', autoAssignParcels);

// Get warehouse parcels
router.get('/warehouses/:id/parcels', getWarehouseParcels);

module.exports = router;
