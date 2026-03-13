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
    origin: { type: String, default: 'Not specified' },
    deliveryType: { type: String, required: true },
    status: { type: String, default: 'Received' },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Logistics Path
    originWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Seller's local warehouse
    destinationWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Customer's local warehouse
    intermediateHubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Regional hubs involved
    currentWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Parcel', parcelSchema);
