require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const regionsMapping = {
    'Western Tamil Nadu': {
        hub: 'Coimbatore',
        districts: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Nilgiris (Ooty)']
    },
    'Northern Tamil Nadu': {
        hub: 'Chennai',
        districts: ['Chennai', 'Tiruvallur', 'Kanchipuram', 'Chengalpattu', 'Vellore', 'Ranipet', 'Tirupathur', 'Tiruvannamalai']
    },
    'Central Tamil Nadu': {
        hub: 'Trichy',
        districts: ['Tiruchirappalli', 'Karur', 'Perambalur', 'Ariyalur', 'Thanjavur', 'Pudukkottai', 'Kallakurichi', 'Tiruvarur']
    },
    'Southern Tamil Nadu': {
        hub: 'Madurai',
        districts: ['Madurai', 'Dindigul', 'Sivaganga', 'Virudhunagar', 'Theni', 'Ramanathapuram', 'Tenkasi']
    },
    'Coastal South/East Tamil Nadu': {
        hub: 'Tirunelveli',
        districts: ['Tirunelveli', 'Thoothukudi', 'Kanniyakumari', 'Cuddalore', 'Viluppuram', 'Nagapattinam', 'Mayiladuthurai']
    }
};

const districtsData = [
    { name: 'Ariyalur', lat: 11.14, lng: 78.56 },
    { name: 'Chengalpattu', lat: 12.42, lng: 80.01 },
    { name: 'Chennai', lat: 13.04, lng: 80.17 },
    { name: 'Coimbatore', lat: 11.00, lng: 77.00 },
    { name: 'Cuddalore', lat: 11.43, lng: 79.49 },
    { name: 'Dharmapuri', lat: 12.08, lng: 78.13 },
    { name: 'Dindigul', lat: 10.22, lng: 78.00 },
    { name: 'Erode', lat: 11.20, lng: 77.46 },
    { name: 'Kallakurichi', lat: 11.44, lng: 78.59 },
    { name: 'Kanchipuram', lat: 12.50, lng: 79.45 },
    { name: 'Kanniyakumari', lat: 8.04, lng: 77.36 },
    { name: 'Karur', lat: 10.58, lng: 78.07 },
    { name: 'Krishnagiri', lat: 12.32, lng: 78.16 },
    { name: 'Madurai', lat: 9.58, lng: 78.10 },
    { name: 'Mayiladuthurai', lat: 11.06, lng: 79.42 },
    { name: 'Nagapattinam', lat: 10.79, lng: 79.84 },
    { name: 'Namakkal', lat: 11.13, lng: 78.13 },
    { name: 'Nilgiris (Ooty)', lat: 11.24, lng: 76.44 },
    { name: 'Perambalur', lat: 11.14, lng: 78.56 },
    { name: 'Pudukkottai', lat: 10.23, lng: 78.52 },
    { name: 'Ramanathapuram', lat: 9.22, lng: 78.52 },
    { name: 'Ranipet', lat: 12.56, lng: 79.24 },
    { name: 'Salem', lat: 11.39, lng: 78.12 },
    { name: 'Sivaganga', lat: 9.51, lng: 78.29 },
    { name: 'Tenkasi', lat: 8.58, lng: 77.21 },
    { name: 'Thanjavur', lat: 10.47, lng: 79.10 },
    { name: 'Theni', lat: 10.01, lng: 77.24 },
    { name: 'Thoothukudi', lat: 8.48, lng: 78.11 },
    { name: 'Tiruchirappalli', lat: 10.50, lng: 78.46 },
    { name: 'Tirunelveli', lat: 8.44, lng: 77.44 },
    { name: 'Tirupathur', lat: 12.29, lng: 78.34 },
    { name: 'Tiruppur', lat: 11.05, lng: 77.20 },
    { name: 'Tiruvallur', lat: 13.09, lng: 79.57 },
    { name: 'Tiruvannamalai', lat: 12.15, lng: 79.07 },
    { name: 'Tiruvarur', lat: 10.46, lng: 79.38 },
    { name: 'Vellore', lat: 12.55, lng: 79.11 },
    { name: 'Viluppuram', lat: 11.57, lng: 79.32 },
    { name: 'Virudhunagar', lat: 9.35, lng: 77.57 }
];

async function seedDistrictsManagers() {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/thisai_db";
        await mongoose.connect(mongoURI);
        console.log('MongoDB connection SUCCESS');

        await User.deleteMany({ role: 'manager' });
        console.log('Existing managers deleted.');

        let count = 0;
        for (const data of districtsData) {
            // Find which region this district belongs to
            let districtRegion = 'General';
            let districtHub = data.name;

            for (const [regionName, regionData] of Object.entries(regionsMapping)) {
                if (regionData.districts.includes(data.name)) {
                    districtRegion = regionName;
                    break;
                }
            }

            const manager = {
                name: `${data.name} Manager`,
                email: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@manager.com`,
                password: 'password123',
                role: 'manager',
                region: districtRegion,
                hub: data.name,
                location: {
                    city: data.name,
                    state: 'Tamil Nadu',
                    country: 'India',
                    latitude: data.lat,
                    longitude: data.lng
                }
            };
            await User.create(manager);
            count++;
        }
        console.log(`${count} Managers seeded successfully with regional segregation.`);
        process.exit();
    } catch (error) {
        console.error('District Manager seeding error:', error);
        process.exit(1);
    }
}

seedDistrictsManagers();
