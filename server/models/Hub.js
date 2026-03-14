const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    region: {
        type: String,
        enum: ['Western', 'Northern', 'Central', 'Southern', 'Coastal South'],
        required: true
    },
    isRegionalCenter: {
        type: Boolean,
        default: false
    },
    borderHubData: [{
        connectedRegion: String,
        handoffPoints: [String]
    }],
    routes: [{
        destination: String,
        stops: [String]
    }],
    location: {
        lat: Number,
        lng: Number
    }
}, {
    timestamps: true
});

const Hub = mongoose.model('Hub', hubSchema);

module.exports = Hub;
