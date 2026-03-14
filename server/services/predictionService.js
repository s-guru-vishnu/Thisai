const { getLiveWeather } = require('./weatherService');

/**
 * Calculates delivery delay and ETA based on weather, traffic, and distance factors.
 * @param {Object} parcel - The parcel document.
 * @returns {Promise<Object>} - Prediction data including delayMinutes, delayRisk, and eta.
 */
const calculateDelayInternal = async (parcel) => {
    let lat = 13.0827; // Default Chennai
    let lng = 80.2707;
    let distanceFactor = 1.0;
    
    if (parcel && parcel.currentLocation) {
         lat = parcel.currentLocation.lat;
         lng = parcel.currentLocation.lng;
         distanceFactor = 1.1; 
    }

    const weather = await getLiveWeather(lat, lng);
    let weatherRiskFactor = 1.0;
    if (weather.riskLevel === 'HIGH') weatherRiskFactor = 1.6;
    else if (weather.riskLevel === 'MEDIUM') weatherRiskFactor = 1.25;
    
    const hour = new Date().getHours();
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    const trafficDelayFactor = isRushHour ? 1.5 : 1.0;

    const routeScore = distanceFactor * trafficDelayFactor * weatherRiskFactor;
    let delayRisk = 'LOW';
    let customReason = 'Clear route';
    
    if (routeScore >= 1.8) {
         delayRisk = 'HIGH';
         if (weatherRiskFactor >= 1.6) customReason = `Severe weather conditions (${weather.weatherMain})`;
         else customReason = 'Significant traffic congestion in major regional hubs';
    } else if (routeScore >= 1.3) {
         delayRisk = 'MEDIUM';
         if (weatherRiskFactor > 1.0) customReason = `Moderate weather impact (${weather.weatherDescription})`;
         else customReason = 'Normal transit delays due to traffic flow';
    }
    
    const delayMinutes = Math.floor((routeScore - 1.0) * 20);
    const baseETA = 30 + Math.floor(Math.random() * 20); // Base estimate 30-50m
    const totalETA = baseETA + delayMinutes;

    return {
        delayRisk,
        delayMinutes: delayMinutes > 0 ? delayMinutes : 0,
        reason: customReason,
        routeScore: routeScore.toFixed(2),
        weatherMeta: weather,
        eta: `${totalETA} mins`
    };
};

module.exports = { calculateDelayInternal };
