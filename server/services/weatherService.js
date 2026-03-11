const lastKnownWeather = new Map();

// Sleep helper for retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getLiveWeather = async (lat, lng, retries = 2) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
        
        // Caching: Round lat/lng to 2 decimal places (roughly ~1.1km grid resolution) to prevent spamming the API
        const cacheKey = `${parseFloat(lat).toFixed(2)}_${parseFloat(lng).toFixed(2)}`;
        const now = Date.now();
        
        if (lastKnownWeather.has(cacheKey)) {
            const cachedEntry = lastKnownWeather.get(cacheKey);
            // 15-minute cache threshold (avoiding excessive billing)
            if (now - cachedEntry.timestamp < 15 * 60 * 1000) {
                return cachedEntry.data;
            }
        }

        if (!apiKey || apiKey === 'PASTE_YOUR_WEATHER_API_KEY_HERE') {
            console.warn('[WEATHER] API Key missing. Returning safe default state.');
            return {
                temperature: 25,
                weatherMain: "Clear",
                weatherDescription: "API Key Missing",
                windSpeed: 0,
                rainVolume: 0,
                visibility: 10000,
                riskLevel: "UNKNOWN"
            };
        }

        const url = `${baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
        
        // Setup Native Fetch with fallback
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`OpenWeather API error: ${response.status}`);
        }
        
        const data = await response.json();

        // 3. Parse response into structured object
        const temperature = data.main?.temp || 0;
        const weatherMain = data.weather?.[0]?.main || 'Clear';
        const weatherDescription = data.weather?.[0]?.description || 'clear sky';
        const windSpeed = data.wind?.speed || 0;
        const rainVolume = data.rain?.['1h'] || 0;
        const visibility = data.visibility || 10000;

        // Risk Classification Evaluator
        let riskLevel = "LOW";
        
        if (['Rain', 'Thunderstorm', 'Snow', 'Extreme', 'Tornado'].includes(weatherMain)) {
            riskLevel = "HIGH";
        } else if (windSpeed > 10.8) { // > 10.8 m/s = "Strong breeze" (approx 40km/h) => Medium risk
            riskLevel = "MEDIUM";
        }

        const weatherResult = {
            temperature,
            weatherMain,
            weatherDescription,
            windSpeed,
            rainVolume,
            visibility,
            riskLevel
        };

        // Save successfully fetched data to memory cache
        lastKnownWeather.set(cacheKey, { timestamp: now, data: weatherResult });

        return weatherResult;
    } catch (error) {
        if (retries > 0) {
            console.warn(`[WEATHER] Fetch failed, retrying... (${retries} left)`);
            await sleep(1000);
            return getLiveWeather(lat, lng, retries - 1);
        }
        console.error(`[WEATHER] Extensively failed to fetch: ${error.message}`);
        return { riskLevel: "UNKNOWN", error: error.message };
    }
};

module.exports = {
    getLiveWeather
};
