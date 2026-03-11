const mongoose = require('mongoose');

const delayPredictionSchema = new mongoose.Schema({
    parcelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parcel', required: true },
    predictedDelay: { type: Number, required: true }, // in hours or days
    factors: { type: [String], default: [] },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 }
}, { timestamps: true });

module.exports = mongoose.model('DelayPrediction', delayPredictionSchema);
