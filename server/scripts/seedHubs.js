require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Hub = require('../models/Hub');

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

const regionalHubs = [
    { name: 'Coimbatore', region: 'Western' },
    { name: 'Chennai', region: 'Northern' },
    { name: 'Trichy', region: 'Central' },
    { name: 'Madurai', region: 'Southern' },
    { name: 'Tirunelveli', region: 'Coastal South' }
];

const borderHubsInfo = [
    { connection: 'Western ↔ Northern', hubs: ['Salem', 'Vellore', 'Tirupattur'], regions: ['Western', 'Northern'] },
    { connection: 'Western ↔ Central', hubs: ['Namakkal', 'Salem', 'Trichy', 'Perambalur'], regions: ['Western', 'Central'] },
    { connection: 'Northern ↔ Central', hubs: ['Villupuram', 'Chengalpattu', 'Ranipet'], regions: ['Northern', 'Central'] },
    { connection: 'Central ↔ Southern', hubs: ['Trichy', 'Pudukkottai', 'Sivagangai', 'Dindigul'], regions: ['Central', 'Southern'] },
    { connection: 'Southern ↔ Coastal South', hubs: ['Madurai', 'Tirunelveli', 'Thoothukudi'], regions: ['Southern', 'Coastal South'] },
    { connection: 'Central ↔ Coastal South', hubs: ['Cuddalore', 'Nagapattinam', 'Thanjavur', 'Ariyalur'], regions: ['Central', 'Coastal South'] }
];

const hubToHubPaths = {
    'Chennai': {
        'Trichy': ['Chennai', 'Villupuram', 'Trichy'],
        'Madurai': ['Chennai', 'Villupuram', 'Trichy', 'Pudukkottai', 'Madurai'],
        'Coimbatore': ['Chennai', 'Villupuram', 'Trichy', 'Namakkal', 'Salem', 'Coimbatore'],
        'Tirunelveli': ['Chennai', 'Villupuram', 'Trichy', 'Pudukkottai', 'Madurai', 'Tirunelveli']
    },
    'Trichy': {
        'Chennai': ['Trichy', 'Villupuram', 'Chennai'],
        'Madurai': ['Trichy', 'Pudukkottai', 'Madurai'],
        'Coimbatore': ['Trichy', 'Namakkal', 'Salem', 'Coimbatore'],
        'Tirunelveli': ['Trichy', 'Cuddalore', 'Nagapattinam', 'Madurai', 'Tirunelveli']
    },
    'Madurai': {
        'Trichy': ['Madurai', 'Pudukkottai', 'Trichy'],
        'Chennai': ['Madurai', 'Trichy', 'Villupuram', 'Chennai'],
        'Coimbatore': ['Madurai', 'Trichy', 'Namakkal', 'Salem', 'Coimbatore'],
        'Tirunelveli': ['Madurai', 'Tirunelveli']
    },
    'Coimbatore': {
        'Trichy': ['Coimbatore', 'Namakkal', 'Salem', 'Trichy'],
        'Chennai': ['Coimbatore', 'Salem', 'Krishnagiri', 'Vellore', 'Chennai'],
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

async function seedHubs() {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/thisai_db";
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for Hub Seeding...');

        await Hub.deleteMany({});
        console.log('Cleared existing hubs.');

        for (const data of regionalHubs) {
            // Find the Regional Manager for this hub
            const manager = await User.findOne({ 
                city: data.name, 
                role: 'manager',
                isRegionalHub: true 
            });

            if (!manager) {
                console.error(`Manager for ${data.name} Regional Hub not found! Make sure to run seedManagers.js first.`);
                continue;
            }

            const routes = Object.entries(hubToHubPaths[data.name]).map(([dest, stops]) => ({
                destination: dest,
                stops: stops
            }));

            const borderHubData = borderHubsInfo
                .filter(b => b.regions.includes(data.region))
                .map(b => ({
                    connectedRegion: b.regions.find(r => r !== data.region),
                    handoffPoints: b.hubs
                }));

            await Hub.create({
                name: data.name,
                displayName: `${data.name} Regional Hub`,
                manager: manager._id,
                region: data.region,
                isRegionalCenter: true,
                location: hubCoordinates[data.name],
                routes: routes,
                borderHubData: borderHubData
            });

            console.log(`Seeded ${data.name} Regional Hub.`);
        }

        console.log('Hub seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Hub seeding failed:', err);
        process.exit(1);
    }
}

seedHubs();
