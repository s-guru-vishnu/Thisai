const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getWarehouses, createWarehouse, getAllParcels } = require('../controllers/adminController');

// Get all users
router.get('/users', getUsers);

// Delete user
router.delete('/users/:id', deleteUser);

// Get all warehouses
router.get('/warehouses', getWarehouses);

// Create warehouse
router.post('/warehouses', createWarehouse);

// Get all parcels
router.get('/parcels', getAllParcels);

module.exports = router;
