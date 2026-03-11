const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getWarehouses, createWarehouse, getAllParcels, createParcel, getDashboardStats, getLiveMapData, getNotifications, getReassignmentSuggestions } = require('../controllers/adminController');

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
router.post('/parcels', createParcel);

// Get dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Get live map data
router.get('/live-map', getLiveMapData);

// Get notifications
router.get('/notifications', getNotifications);

// Get load balancing reassignment suggestions
router.get('/reassignment-suggestions', getReassignmentSuggestions);

module.exports = router;
