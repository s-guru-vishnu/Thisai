const Parcel = require('../models/Parcel');
const Warehouse = require('../models/Warehouse');

// @desc    Get warehouse parcels
// @route   GET /api/warehouse/parcels
// @access  Private/Warehouse
const getWarehouseParcels = async (req, res) => {
    try {
        const parcels = await Parcel.find({ warehouse: req.user.warehouse });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update parcel warehouse
// @route   PUT /api/warehouse/parcels/:id
// @access  Private/Warehouse
const updateParcelWarehouse = async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (parcel) {
            parcel.warehouse = req.user.warehouse;
            const updatedParcel = await parcel.save();
            res.json(updatedParcel);
        } else {
            res.status(404).json({ message: 'Parcel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get warehouse info
// @route   GET /api/warehouse
// @access  Private/Warehouse
const getWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.user.warehouse);
        res.json(warehouse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWarehouseParcels, updateParcelWarehouse, getWarehouse };
