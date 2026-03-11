const { getLiveWeather } = require('./weatherService');

// In-Memory cache for route matrix API calls and states
const driverRouteCache = new Map();
const prevETAs = new Map();

/**
 * PRODUCTION-READY ROUTING ENGINE
 * Contains extended heuristic algorithms, stability caches, and lifecycle safety models.
 */

// Helper: Calculate standard Euclidean distance (Haversine formula for geo)
const getHaversineDistance = (loc1, loc2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLng = toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Stage 8: GPS Noise Filtering
const filterGPSDrift = (oldLoc, newLoc) => {
    if (!oldLoc) return newLoc;
    const dist = getHaversineDistance(oldLoc, newLoc);
    if (dist < 0.05) return oldLoc; // Ignore jumps < 50 meters
    return newLoc;
};

// Stage 3: ETA Stability Engine
const smoothETA = (stopId, newETAMins) => {
    const alpha = 0.2; 
    if (!prevETAs.has(stopId)) {
        prevETAs.set(stopId, newETAMins);
        return Math.round(newETAMins);
    }
    const oldETA = prevETAs.get(stopId);
    if (Math.abs(newETAMins - oldETA) > 3) { // Only update if deviation > 3 mins
        const smoothed = (alpha * newETAMins) + ((1 - alpha) * oldETA);
        prevETAs.set(stopId, smoothed);
        return Math.round(smoothed);
    }
    return Math.round(oldETA);
};

// Stage 1: Delivery Lifecycle
const filterActiveStops = (stops) => {
    const active = stops.filter(s => s.status !== 'DELIVERED');
    const failed = active.filter(s => s.status === 'FAILED');
    const pending = active.filter(s => s.status !== 'FAILED');
    return { pending, failed };
};

// Stage 2: Urgent Delivery Local Insertion
const insertUrgentDelivery = (currentSequence, newStop, currentLoc) => {
    let bestIndex = 0;
    let minAddedDelay = Infinity;

    for (let i = 0; i <= currentSequence.length; i++) {
        const prevLoc = i === 0 ? currentLoc : currentSequence[i - 1].location;
        const nextLoc = i === currentSequence.length ? null : currentSequence[i].location;
        
        let originalDist = nextLoc ? getHaversineDistance(prevLoc, nextLoc) : 0;
        let newDist = getHaversineDistance(prevLoc, newStop.location) + 
                     (nextLoc ? getHaversineDistance(newStop.location, nextLoc) : 0);
                     
        let addedDelay = newDist - originalDist;
        if (addedDelay < minAddedDelay) {
            minAddedDelay = addedDelay;
            bestIndex = i;
        }
    }
    
    const newSeq = [...currentSequence];
    newSeq.splice(bestIndex, 0, newStop);
    return newSeq;
};

// Stage 2: Pickup Route Intelligence
const calculatePickupRoute = async (driverLoc, warehouseLoc) => {
    const distanceKm = getHaversineDistance(driverLoc, warehouseLoc);
    let travelTimeMins = distanceKm * 2; 
    let trafficDelayPercent = 1.0; 
    
    const hour = new Date().getHours();
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
        trafficDelayPercent = 1.5; 
        travelTimeMins *= 1.5; 
    }

    // Weather Risk Component (Stage 6 Hard Rule implementation & Stage 10)
    let weather;
    try {
        weather = await getLiveWeather(driverLoc.lat, driverLoc.lng);
    } catch (e) {
        weather = { riskLevel: 'UNKNOWN', message: 'API Timeout' }; // Resilience
    }
    
    let weatherRiskLevel = 1.0;
    let isUnsafe = false;

    if (weather.riskLevel === 'EXTREME') { // Stage 6
        weatherRiskLevel = 5.0;
        isUnsafe = true;
    } else if (weather.riskLevel === 'HIGH') {
        weatherRiskLevel = 1.6;
    } else if (weather.riskLevel === 'MEDIUM') {
        weatherRiskLevel = 1.25;
    }

    const routeScore = (0.5 * travelTimeMins) * (1 + 0.3 * trafficDelayPercent) * (1 + 0.2 * weatherRiskLevel);

    return {
        distanceKm: distanceKm.toFixed(2),
        travelTimeMins: Math.round(travelTimeMins),
        routeScore: routeScore.toFixed(2),
        weatherRiskLevel,
        riskLevelStr: weather.riskLevel,
        isUnsafe
    };
};

// Stage 3 & 7: Smart Multi-Delivery Sequencing + Service Time Modeling
const optimizeDeliverySequence = async (currentLoc, pendingStops) => {
    const { pending, failed } = filterActiveStops(pendingStops);
    if (!pending || pending.length === 0) return failed;

    let unvisited = [...pending];
    let optimizedSequence = [];
    let currentPos = currentLoc;

    while (unvisited.length > 0) {
        let bestStopIndex = -1;
        let lowestCost = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const stop = unvisited[i];
            const dist = getHaversineDistance(currentPos, stop.location);
            
            let priorityDiscount = 1.0; 
            if (stop.priority === 'Urgent') priorityDiscount = 0.5;
            else if (stop.priority === 'High') priorityDiscount = 0.8;

            const cost = dist * priorityDiscount;

            if (cost < lowestCost) {
                lowestCost = cost;
                bestStopIndex = i;
            }
        }

        const nextStop = unvisited.splice(bestStopIndex, 1)[0];
        const corridorStops = unvisited.filter(s => getHaversineDistance(nextStop.location, s.location) <= 2.0);
        
        // Stage 7 Model: Add Base Service Duration
        nextStop.serviceDurationMinutes = nextStop.serviceDurationMinutes || 5;
        optimizedSequence.push(nextStop);
        currentPos = nextStop.location;

        if (corridorStops.length > 0) {
            corridorStops.sort((a, b) => getHaversineDistance(currentPos, a.location) - getHaversineDistance(currentPos, b.location));
            
            for (const clusterStop of corridorStops) {
                clusterStop.serviceDurationMinutes = clusterStop.serviceDurationMinutes || 5;
                optimizedSequence.push(clusterStop);
                currentPos = clusterStop.location;
                unvisited = unvisited.filter(u => u.id !== clusterStop.id);
            }
        }
    }

    // Append failed stops to the tail (Stage 1)
    return [...optimizedSequence, ...failed];
};

// Stage 4 & 5 & 11: Route Cache & Stability Guard
const getCachedOrComputeRoute = async (driverId, currentLoc, stops) => {
    const now = Date.now();
    const CACHE_WINDOW = 20000; // 20s prevent recompute burst

    if (driverRouteCache.has(driverId)) {
        const cached = driverRouteCache.get(driverId);
        if (now - cached.timestamp < CACHE_WINDOW) {
            return cached.data;
        }
    }

    const sequence = await optimizeDeliverySequence(currentLoc, stops);
    const data = { sequence };
    
    driverRouteCache.set(driverId, { timestamp: now, data });
    return data;
};

// Stage 9: Driver Load Balancing
const calculateBurdenScore = (todayDistance, activeStops, cumulativeDelay) => {
    const normalizedDistance = todayDistance / 50; 
    const normalizedStops = activeStops / 20; 
    const normalizedDelay = cumulativeDelay > 0 ? (cumulativeDelay / 60) : 0.1; 

    const burdenScore = (normalizedDistance + normalizedStops + normalizedDelay) / 3;
    return burdenScore.toFixed(2); 
};

module.exports = {
    calculatePickupRoute,
    optimizeDeliverySequence,
    calculateBurdenScore,
    filterGPSDrift,
    smoothETA,
    insertUrgentDelivery,
    getCachedOrComputeRoute
};
