const axios = require('axios');
const { getLiveWeather } = require('./weatherService');

// In-Memory cache for route matrix API calls and states
const driverRouteCache = new Map();
const prevETAs = new Map();
const prevDisplayETAs = new Map();

const BASE_CITY_SPEED = 20; // km/h fallback
const BASE_HIGHWAY_SPEED = 60; // km/h fallback for inter-city

/**
 * INTELLIGENT ROUTING ENGINE (REBUILT)
 * Optimized for:
 * 1. Multi-Stop TSP via Nearest Neighbor.
 * 2. Hybrid Dynamic ETA (Traffic + Behavior).
 * 3. EMA Smoothing for Stability.
 */

/**
 * Helper: Calculate Haversine distance between two coordinates in KM
 */
const getDistance = (loc1, loc2) => {
    if (!loc1 || !loc2 || !loc1.lat || !loc1.lng || !loc2.lat || !loc2.lng) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLng = toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Fetch Real Road Distance and Traffic Duration from Google Maps
 */
const getGoogleRouteData = async (origin, destination) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        // Fallback to Haversine-based estimations if no key
        const distKm = getDistance(origin, destination);
        return {
            distanceMeters: Math.round(distKm * 1000),
            durationInTrafficSeconds: Math.round(distKm * 1.8 * 60) // Rough estimate
        };
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&traffic_model=best_guess&departure_time=now&key=${apiKey}`;
        const res = await axios.get(url);

        if (res.data.status === 'OK') {
            const leg = res.data.routes[0].legs[0];
            return {
                distanceMeters: leg.distance.value,
                durationInTrafficSeconds: leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value
            };
        }
    } catch (err) {
        console.error("[Router] Google API Error:", err.message);
    }

    // Secondary fallback
    const distKm = getDistance(origin, destination);
    return { distanceMeters: Math.round(distKm * 1000), durationInTrafficSeconds: Math.round(distKm * 2 * 60) };
};

/**
 * Format minutes into "X hr Y mins" or "Y mins"
 */
const formatDuration = (totalMins) => {
    if (totalMins === null || totalMins === undefined || isNaN(totalMins)) return "-";
    const mins = Math.round(totalMins);
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} hr ${m} mins` : `${h} hr`;
};

/**
 * Compute Hybrid Dynamic ETA
 */
const computeHybridETA = (roadDistMeters, trafficSecs, avgSpeedKmh, status) => {
    if (status === 'NOT_STARTED') return null;

    const distKm = roadDistMeters / 1000;
    const trafficETA = trafficSecs / 60;
    
    let speedToUse = avgSpeedKmh;
    if (status === 'STOPPED' || avgSpeedKmh < 5) {
        // ADAPTIVE FALLBACK: Use highway speed for long distances to avoid ETA explosion
        speedToUse = distKm > 20 ? BASE_HIGHWAY_SPEED : BASE_CITY_SPEED;
    }

    const speedETA = (distKm / speedToUse) * 60;
    const finalETA = (0.7 * trafficETA) + (0.3 * speedETA);
    return Math.round(finalETA);
};

/**
 * GPS Noise Filtering
 */
const filterGPSDrift = (oldLoc, newLoc) => {
    if (!oldLoc || !newLoc) return newLoc;
    const dist = getDistance(oldLoc, newLoc);
    return dist < 0.03 ? oldLoc : newLoc;
};

/**
 * EMA Smoothing
 */
const getSmoothedETA = (driverId, newFinalETA) => {
    if (newFinalETA === null || newFinalETA === undefined) return null;
    if (!prevDisplayETAs.has(driverId)) {
        prevDisplayETAs.set(driverId, newFinalETA);
        return newFinalETA;
    }
    const prev = prevDisplayETAs.get(driverId);
    const smoothed = (prev * 0.7) + (newFinalETA * 0.3);
    prevDisplayETAs.set(driverId, smoothed);
    return Math.round(smoothed);
};

/**
 * Pickup Route Intelligence
 */
const calculatePickupRoute = async (driverLoc, warehouseLoc, driverStats = {}) => {
    const routeData = await getGoogleRouteData(driverLoc, warehouseLoc);
    const rawETA = computeHybridETA(
        routeData.distanceMeters, 
        routeData.durationInTrafficSeconds, 
        driverStats.avgSpeed || 0, 
        driverStats.status || 'MOVING'
    );

    return {
        distanceKm: (routeData.distanceMeters / 1000).toFixed(2),
        travelTimeMins: rawETA,
        routeData 
    };
};

/**
 * optimizeDeliverySequence
 */
const optimizeDeliverySequence = async (startLoc, rawStops) => {
    if (!rawStops || rawStops.length === 0) return [];
    let unvisited = rawStops.filter(s => s.status !== 'Delivered' && s.location && s.location.lat);
    let sequence = [];
    let currentPos = startLoc;

    while (unvisited.length > 0) {
        let bestScore = Infinity;
        let bestIdx = -1;
        for (let i = 0; i < unvisited.length; i++) {
            const stop = unvisited[i];
            const dist = getDistance(currentPos, stop.location);
            let pWeight = stop.priority === 'Urgent' ? 0.4 : 1.0;
            const score = dist * pWeight;
            if (score < bestScore) { bestScore = score; bestIdx = i; }
        }
        const nextStop = unvisited.splice(bestIdx, 1)[0];
        sequence.push(nextStop);
        currentPos = nextStop.location;
    }
    return sequence;
};

/**
 * Caching & Segmented ETA Calculation
 */
const getCachedOrComputeRoute = async (driverId, startLoc, stops, driverStats = {}) => {
    const now = Date.now();
    const CACHE_TTL = 30000;

    if (driverRouteCache.has(driverId)) {
        const cached = driverRouteCache.get(driverId);
        if (now - cached.timestamp < CACHE_TTL) return cached.data;
    }

    const sequence = await optimizeDeliverySequence(startLoc, stops);
    
    // Calculate Segmented Leg Durations
    let currentPoint = startLoc;
    for (let stop of sequence) {
        const legData = await getGoogleRouteData(currentPoint, stop.location);
        const legMins = computeHybridETA(
            legData.distanceMeters, 
            legData.durationInTrafficSeconds, 
            driverStats.avgSpeed || 25, 
            'MOVING'
        );
        stop.legDurationMins = legMins;
        stop.legDistanceKm = (legData.distanceMeters / 1000).toFixed(2);
        currentPoint = stop.location;
    }

    const result = { sequence };
    driverRouteCache.set(driverId, { timestamp: now, data: result });
    return result;
};

const calculateBurdenScore = (distance, stops, delay) => {
    // Stage 9 Burden Logic: Weighting stops and delays over raw distance
    const score = (stops * 0.4) + (delay * 0.01) + (distance * 0.005);
    return Math.min(score, 1).toFixed(2);
};

module.exports = {
    calculatePickupRoute,
    optimizeDeliverySequence,
    filterGPSDrift,
    getSmoothedETA,
    getCachedOrComputeRoute,
    computeHybridETA,
    formatDuration,
    calculateBurdenScore
};

