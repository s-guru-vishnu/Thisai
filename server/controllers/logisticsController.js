const Hub = require('../models/Hub');
const { hubCoordinates } = require('../utils/logisticsRoutes');

// @desc    Get all regional hubs
// @route   GET /api/logistics/hubs
// @access  Private
const getHubs = async (req, res) => {
    try {
        const hubs = await Hub.find({ isRegionalCenter: true }).populate('manager', 'name email phone');
        res.json(hubs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPath = async (req, res) => {
    try {
        const { startHub, endHub } = req.query;

        if (!startHub || !endHub) {
            return res.status(400).json({ message: 'Start and end hubs are required' });
        }

        // Clean hub names if they come with " Regional Hub" suffix
        const cleanStart = startHub.replace(' Regional Hub', '');
        const cleanEnd = endHub.replace(' Regional Hub', '');

        const hub = await Hub.findOne({ name: cleanStart });
        
        if (!hub) {
            return res.status(404).json({ message: `Starting hub ${cleanStart} not found` });
        }

        const route = hub.routes.find(r => r.destination === cleanEnd);

        if (!route) {
            // Fallback to direct path or error
            const directStops = [
                { id: 'start', name: startHub, location: hubCoordinates[cleanStart] || { lat: 11.0, lng: 77.0 } },
                { id: 'end', name: endHub, location: hubCoordinates[cleanEnd] || { lat: 13.0, lng: 80.0 } }
            ];
            return res.json({ stops: directStops });
        }

        const stops = route.stops.map((stopName, index) => ({
            id: `STOP-${index}`,
            productName: `Hub-to-Hub Batch ${index + 1}`,
            trackingCode: `HUB-${stopName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`,
            destination: `${stopName} Hub`,
            location: hubCoordinates[stopName] || { lat: 11.0, lng: 77.0 }
        }));

        res.json({ stops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPath, getHubs };
