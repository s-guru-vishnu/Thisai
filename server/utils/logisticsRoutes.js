/**
 * Predefined Hub-to-Hub Logistics Paths
 * These paths define the sequence of hubs for inter-regional cargo transport.
 * Base Regions: Northern (Chennai), Central (Trichy), Southern (Madurai), Western (Coimbatore), Coastal South (Tirunelveli)
 */

const hubCoordinates = {
    'Chennai': { lat: 13.04, lng: 80.17 },
    'Villupuram': { lat: 11.57, lng: 79.32 },
    'Trichy': { lat: 10.50, lng: 78.46 },
    'Pudukkottai': { lat: 10.23, lng: 78.52 },
    'Madurai': { lat: 9.58, lng: 78.10 },
    'Tirunelveli': { lat: 8.44, lng: 77.44 },
    'Coimbatore': { lat: 11.00, lng: 77.00 },
    'Namakkal': { lat: 11.13, lng: 78.13 },
    'Salem': { lat: 11.39, lng: 78.12 },
    'Cuddalore': { lat: 11.43, lng: 79.49 },
    'Nagapattinam': { lat: 10.79, lng: 79.84 },
    'Vellore': { lat: 12.55, lng: 79.11 },
    'Ranipet': { lat: 12.56, lng: 79.24 },
    'Krishnagiri': { lat: 12.32, lng: 78.16 }
};

const logisticsPaths = {
    'Chennai': {
        'Trichy': ['Chennai', 'Villupuram', 'Trichy'],
        'Madurai': ['Chennai', 'Villupuram', 'Trichy', 'Pudukkottai', 'Madurai'],
        'Coimbatore': ['Chennai', 'Villupuram', 'Trichy', 'Salem', 'Coimbatore'],
        'Tirunelveli': ['Chennai', 'Villupuram', 'Trichy', 'Pudukkottai', 'Madurai', 'Tirunelveli']
    },
    'Trichy': {
        'Chennai': ['Trichy', 'Villupuram', 'Chennai'],
        'Madurai': ['Trichy', 'Pudukkottai', 'Madurai'],
        'Coimbatore': ['Trichy', 'Namakkal', 'Coimbatore'],
        'Tirunelveli': ['Trichy', 'Nagapattinam', 'Madurai', 'Tirunelveli']
    },
    'Madurai': {
        'Trichy': ['Madurai', 'Pudukkottai', 'Trichy'],
        'Chennai': ['Madurai', 'Trichy', 'Villupuram', 'Chennai'],
        'Coimbatore': ['Madurai', 'Trichy', 'Salem', 'Coimbatore'],
        'Tirunelveli': ['Madurai', 'Tirunelveli']
    },
    'Coimbatore': {
        'Trichy': ['Coimbatore', 'Salem', 'Trichy'],
        'Chennai': ['Coimbatore', 'Salem', 'Vellore', 'Chennai'],
        'Madurai': ['Coimbatore', 'Salem', 'Trichy', 'Pudukkottai', 'Madurai'],
        'Tirunelveli': ['Coimbatore', 'Salem', 'Trichy', 'Madurai', 'Tirunelveli']
    },
    'Tirunelveli': {
        'Madurai': ['Tirunelveli', 'Madurai'],
        'Trichy': ['Tirunelveli', 'Madurai', 'Pudukkottai', 'Trichy'],
        'Chennai': ['Tirunelveli', 'Madurai', 'Trichy', 'Villupuram', 'Chennai'],
        'Coimbatore': ['Tirunelveli', 'Madurai', 'Trichy', 'Salem', 'Coimbatore']
    }
};

/**
 * Generates a full path with coordinates for a cargo delivery
 * @param {string} startHub - Starting hub city
 * @param {string} endHub - Destination hub city
 * @returns {Array} Array of stop objects with name and location
 */
const getCargoPath = (startHub, endHub) => {
    // Basic validation and fallback
    if (!logisticsPaths[startHub] || !logisticsPaths[startHub][endHub]) {
        // Direct path as fallback if not in mapping
        return [
            { id: 'start', name: startHub, location: hubCoordinates[startHub] || { lat: 11.0, lng: 77.0 } },
            { id: 'end', name: endHub, location: hubCoordinates[endHub] || { lat: 13.0, lng: 80.0 } }
        ];
    }

    return logisticsPaths[startHub][endHub].map((stopName, index) => ({
        id: `STOP-${index}`,
        productName: `Hub-to-Hub Batch ${index + 1}`,
        trackingCode: `HUB-${stopName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`,
        destination: `${stopName} Hub`,
        location: hubCoordinates[stopName] || { lat: 11.0, lng: 77.0 }
    }));
};

module.exports = { getCargoPath, hubCoordinates };
