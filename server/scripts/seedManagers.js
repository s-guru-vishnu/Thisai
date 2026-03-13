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
        districts: ['Chennai', 'Tiruvallur', 'Kanchipuram', 'Chengalpattu', 'Vellore', 'Ranipet', 'Tirupattur', 'Tiruvannamalai']
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
        districts: ['Tirunelveli', 'Thoothukudi', 'Kanniyakumari', 'Cuddalore', 'Villupuram', 'Nagapattinam', 'Mayiladuthurai', 'Tiruvarur']
    }
];

const borderHubsList = [
    'Salem', 'Krishnagiri', 'Vellore', 'Tirupattur', 'Namakkal', 'Trichy', 'Perambalur', 
    'Villupuram', 'Kallakurichi', 'Chengalpattu', 'Ranipet', 'Pudukkottai', 'Sivagangai', 
    'Dindigul', 'Madurai', 'Virudhunagar', 'Tirunelveli', 'Thoothukudi', 'Thanjavur', 
    'Ariyalur', 'Cuddalore', 'Nagapattinam'
];

async function seedManagers() {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/thisai_db";
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB...');

        // Clear existing managers and warehouses to avoid duplicates during re-seeding
        await User.deleteMany({ role: { $in: ['manager', 'warehouse'] } });
        console.log('Cleared existing managers and warehouses.');

        let managerCount = 0;
        let warehouseCount = 0;

        for (const data of regionsData) {
            console.log(`\nSeeding ${data.region}...`);
            
            for (const district of data.districts) {
                const isRegional = district === data.regionalHub;
                const isBorder = borderHubsList.includes(district);

                // 1. Create Manager for this District/Hub
                const managerEmail = `${district.toLowerCase().replace(/\s+/g, '')}@manager.com`;
                await User.create({
                    name: `${district} ${isRegional ? 'Regional' : 'District'} Manager`,
                    email: managerEmail,
                    password: 'password123',
                    role: 'manager',
                    region: data.region,
                    hub: district,
                    isRegionalHub: isRegional,
                    isBorderHub: isBorder,
                    city: district
                });
                managerCount++;

                // 2. Create Warehouse User for this District/Hub
                const warehouseEmail = `${district.toLowerCase().replace(/\s+/g, '')}@warehouse.com`;
                await User.create({
                    name: `${district} ${isRegional ? 'Regional' : 'District'} Warehouse`,
                    email: warehouseEmail,
                    password: 'password123',
                    role: 'warehouse',
                    region: data.region,
                    hub: district,
                    isRegionalHub: isRegional,
                    isBorderHub: isBorder,
                    city: district,
                    warehouseLocation: district
                });
                warehouseCount++;
            }
        }

        console.log(`\nSuccess!`);
        console.log(`Seeded ${managerCount} Managers`);
        console.log(`Seeded ${warehouseCount} Warehouses`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedManagers();
