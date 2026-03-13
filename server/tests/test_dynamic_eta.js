const axios = require('axios');

const API_BASE = 'http://localhost:5000';
const DRIVER_1 = '69b11da377e9b9ba50767c50';
const DRIVER_2 = '65f123456789012345678901';

async function runTest() {
    console.log("=== Bug Fix Verification Simulation ===");

    try {
        // [Test 1] Stationary Jitter Test (Expected Speed: 0, Status: NOT_STARTED)
        console.log("\n[Test 1] Stationary Jitter (Driver 1: Expected < 50m total)");
        const now = Date.now();
        const points1 = [
            { lat: 12.9341, lng: 79.1367, t: now },
            { lat: 12.9342, lng: 79.1368, t: now + 5000 },
            { lat: 12.9341, lng: 79.1367, t: now + 10000 }
        ];

        for (const p of points1) {
            await axios.post(`${API_BASE}/api/driver/location`, {
                driverId: DRIVER_1, lat: p.lat, lng: p.lng, timestamp: p.t
            });
        }

        let res1 = await axios.get(`${API_BASE}/api/driver/optimized-route/${DRIVER_1}`);
        console.log(`Driver 1 -> Speed: ${res1.data.liveSpeed} km/h, Status: ${res1.data.driverStatus}, ETA: ${res1.data.nextActionETA}`);

        // [Test 2] Inter-city Idle ETA Test
        console.log("\n[Test 2] Inter-city Idle (Driver 2: ~50km away from Warehouse)");
        const farLoc = { lat: 13.3000, lng: 79.4000 }; 
        const now2 = Date.now();
        
        // Point 1: Baseline
        await axios.post(`${API_BASE}/api/driver/location`, {
            driverId: DRIVER_2, lat: farLoc.lat, lng: farLoc.lng, timestamp: now2
        });
        // Point 2: Move > 50m (approx 77m)
        await axios.post(`${API_BASE}/api/driver/location`, {
            driverId: DRIVER_2, lat: farLoc.lat + 0.0005, lng: farLoc.lng + 0.0005, timestamp: now2 + 10000
        });

        let res2 = await axios.get(`${API_BASE}/api/driver/optimized-route/${DRIVER_2}`);
        console.log(`Driver 2 -> Dist: ~50km | Phase: ${res2.data.routingPhase} | Status: ${res2.data.driverStatus}`);
        console.log(`Driver 2 -> Speed: ${res2.data.liveSpeed} km/h | ETA: ${res2.data.nextActionETA}`);
        console.log(`(Expect ETA ~45-60 mins for inter-city travel, signifying adaptive fallback)`);

        console.log("\n=== Verification Complete ===");
    } catch (err) {
        console.error("Test Failed:", err.message);
    }
}

runTest();
