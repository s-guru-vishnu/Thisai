const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
    parcelId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    weight: { type: String, required: true },
    seller: { type: String, required: true },
    destination: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryType: { type: String, required: true },
    status: { type: String, default: 'Received' },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
}, { timestamps: true });

module.exports = mongoose.model('Parcel', parcelSchema);
