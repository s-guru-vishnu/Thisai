const User = require('../models/User');
const Warehouse = require('../models/Warehouse');
const Parcel = require('../models/Parcel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all warehouses
// @route   GET /api/admin/warehouses
// @access  Private/Admin
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find({});
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create warehouse
// @route   POST /api/admin/warehouses
// @access  Private/Admin
const createWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.create(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all parcels
// @route   GET /api/admin/parcels
// @access  Private/Admin
const getAllParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({});
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, deleteUser, getWarehouses, createWarehouse, getAllParcels };
