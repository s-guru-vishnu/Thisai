const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getUsers, deleteUser, getWarehouses, createWarehouse, getAllParcels, createParcel, getDashboardStats, getLiveMapData, getNotifications, getReassignmentSuggestions } = require('../controllers/adminController');
=======
const { getUsers, deleteUser, getWarehouses, createWarehouse, getAllParcels, createParcel, getDashboardStats, getLiveMapData, getNotifications } = require('../controllers/adminController');
const { checkLocation } = require('../middleware/authMiddleware');
>>>>>>> 2b4e5cdf2178a0f91a2e4a5c8bb4bd1a1b7660a0

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

// Create parcel
router.post('/parcels', checkLocation, createParcel);

// Get dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Get live map data
router.get('/live-map', getLiveMapData);

// Get notifications
router.get('/notifications', getNotifications);

// Get load balancing reassignment suggestions
router.get('/reassignment-suggestions', getReassignmentSuggestions);

module.exports = router;
