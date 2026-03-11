require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const regionsData = [
    {
        region: 'Western Tamil Nadu',
        regionalHub: 'Coimbatore',
        districts: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Nilgiris']
    },
    {
        region: 'Northern Tamil Nadu',
        regionalHub: 'Chennai',
        districts: ['Chennai', 'Tiruvallur', 'Kanchipuram', 'Chengalpattu', 'Vellore', 'Ranipet', 'Tirupattur']
    },
    {
        region: 'Central Tamil Nadu',
        regionalHub: 'Trichy',
        districts: ['Trichy', 'Karur', 'Perambalur', 'Ariyalur', 'Thanjavur', 'Pudukkottai', 'Kallakurichi']
    },
    {
        region: 'Southern Tamil Nadu',
        regionalHub: 'Madurai',
        districts: ['Madurai', 'Dindigul', 'Sivagangai', 'Virudhunagar', 'Theni', 'Ramanathapuram', 'Tenkasi']
    },
    {
        region: 'Coastal South/East Tamil Nadu',
        regionalHub: 'Tirunelveli',
        districts: ['Tirunelveli', 'Thoothukudi', 'Kanniyakumari', 'Cuddalore', 'Villupuram', 'Nagapattinam', 'Mayiladuthurai']
    }
];

const borderHubs = [
    'Salem', 'Krishnagiri', 'Vellore', 'Tirupattur', 'Namakkal', 'Trichy', 'Perambalur', 'Villupuram', 'Kallakurichi', 'Chengalpattu', 'Ranipet', 'Pudukkottai', 'Sivagangai', 'Dindigul', 'Madurai', 'Virudhunagar', 'Tirunelveli', 'Thoothukudi', 'Thanjavur', 'Ariyalur', 'Cuddalore', 'Nagapattinam'
];

async function seedManagers() {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/thisai_db"; // Replace later if needed based on env variables
        await mongoose.connect(mongoURI);
        console.log('MongoDB connection SUCCESS');

        await User.deleteMany({ role: 'manager' });
        console.log('Existing managers deleted.');

        let count = 0;
        // Create a manager for each district
        for (const data of regionsData) {
            for (const district of data.districts) {
                let isBorderHub = borderHubs.includes(district) || null;
                let isRegionalHub = data.regionalHub === district || null;

                const manager = {
                    name: `${district} Manager`,
                    email: `${district.toLowerCase().replace(/[^a-z0-9]/g, '')}@manager.com`,
                    password: 'password123',
                    role: 'manager',
                    region: data.region,
                    hub: district,
                };
                await User.create(manager);
                count++;
            }
        }
        console.log(`${count} Managers seeded successfully`);
        process.exit();
    } catch (error) {
        console.error('Initial seeding error:', error);
        process.exit(1);
    }
}

seedManagers();
