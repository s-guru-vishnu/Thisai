const driverBuffer = new Map(); // driverId -> Array of {lat, lng, timestamp}

const MAX_BUFFER_SIZE = 10;
const DRIFT_THRESHOLD_METERS = 150;
const STOP_SPEED_THRESHOLD_KMH = 5;

/**
 * Helper: Calculate Haversine distance between two coordinates in KM
 */
const getDistance = (loc1, loc2) => {
    if (!loc1 || !loc2 || loc1.lat === undefined || loc1.lng === undefined || loc2.lat === undefined || loc2.lng === undefined) return 0;
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
 * Track driver location and filter GPS drift
 */
const trackDriverLocation = (driverId, lat, lng, timestamp) => {
    if (!driverBuffer.has(driverId)) {
        driverBuffer.set(driverId, []);
    }
    const buffer = driverBuffer.get(driverId);
    const newPoint = { lat: parseFloat(lat), lng: parseFloat(lng), timestamp: timestamp || Date.now() };

    if (buffer.length > 0) {
        const lastPoint = buffer[buffer.length - 1];
        const distKm = getDistance(lastPoint, newPoint);
        const timeDiffSec = (newPoint.timestamp - lastPoint.timestamp) / 1000;
        
        if (timeDiffSec <= 0) return;

        // Calculate instantaneous speed between points
        const speedKmh = (distKm / (timeDiffSec / 3600));

        // GPS Drift Filter: 
        // 1. Ignore sudden jumps > 150m in under 5s (Signal Noise)
        // 2. Ignore any point implying speed > 200 km/h (Physically impossible for delivery truck)
        if ((distKm * 1000 > DRIFT_THRESHOLD_METERS && timeDiffSec < 5) || speedKmh > 200) {
            console.warn(`[SpeedService] Drift/Impossible speed detected for driver ${driverId} (${speedKmh.toFixed(1)} km/h), ignoring point.`);
            return;
        }
    }

    buffer.push(newPoint);
    if (buffer.length > MAX_BUFFER_SIZE) {
        buffer.shift();
    }
};

/**
 * Compute rolling average speed and mobility status
 */
const getDriverStats = (driverId) => {
    const buffer = driverBuffer.get(driverId) || [];
    
    // Case 1: Driver not started (no buffer or only 1 point)
    if (buffer.length < 2) {
        return { 
            avgSpeed: 0, 
            status: 'NOT_STARTED', 
            heading: 'N',
            lastPoint: buffer.length > 0 ? buffer[0] : null,
            displacementMeters: 0
        };
    }

    let totalDistKm = 0;
    let totalTimeHr = 0;

    // Calculate sum of distances and times across rolling buffer
    for (let i = 1; i < buffer.length; i++) {
        const p1 = buffer[i - 1];
        const p2 = buffer[i];
        totalDistKm += getDistance(p1, p2);
        totalTimeHr += (p2.timestamp - p1.timestamp) / (1000 * 3600);
    }

    const avgSpeed = totalTimeHr > 0 ? (totalDistKm / totalTimeHr) : 0;
    const displacementMeters = totalDistKm * 1000;
    
    // HEAVY GUARD: If cumulative displacement is < 50m, we are NOT_STARTED.
    // This removes speed creep from minor GPS jitter.
    const isStarted = displacementMeters > 50;
    const status = !isStarted ? 'NOT_STARTED' : (avgSpeed < STOP_SPEED_THRESHOLD_KMH ? 'STOPPED' : 'MOVING');

    // Dynamic Heading Calculation
    const pEnd = buffer[buffer.length - 1];
    let heading = "N";
    if (isStarted) {
        const pStart = buffer[0];
        const dLat = pEnd.lat - pStart.lat;
        const dLng = pEnd.lng - pStart.lng;
        if (Math.abs(dLat) > Math.abs(dLng)) {
            heading = dLat > 0 ? "N" : "S";
        } else {
            heading = dLng > 0 ? "E" : "W";
        }
    }

    return { 
        avgSpeed: status === 'NOT_STARTED' ? 0 : Math.round(avgSpeed), 
        status, 
        heading,
        lastPoint: pEnd,
        displacementMeters: Math.round(displacementMeters)
    };
};

module.exports = { trackDriverLocation, getDriverStats };
