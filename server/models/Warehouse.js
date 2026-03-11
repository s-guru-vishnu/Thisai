const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentStock: { type: Number, default: 0 },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
