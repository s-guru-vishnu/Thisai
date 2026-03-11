const { getLiveWeather } = require('../services/weatherService');

// @desc    Get live weather data based on coordinates
// @route   GET /api/weather/live
// @access  Private
const getLiveWeatherAPI = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude are required query parameters' });
        }
        
        const weatherData = await getLiveWeather(lat, lng);
        res.json(weatherData);
    } catch (error) {
        console.error("Weather Controller Error:", error);
        res.status(500).json({ riskLevel: "UNKNOWN", message: error.message });
    }
};

module.exports = {
    getLiveWeatherAPI
};
