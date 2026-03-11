const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const districts = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
    'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur',
    'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
    'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem',
    'Sivaganga', 'Tenkasi', 'Thanjavur', 'The Nilgiris', 'Theni', 'Thiruvallur',
    'Thiruvarur', 'Thoothukkudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur',
    'Tiruppur', 'Tiruvannamalai', 'Vellore', 'Viluppuram', 'Virudhunagar'
];

const seedWarehouseUsers = async () => {
    try {
        // Simple check to ensure MONGO_URI is present
        if (!process.env.MONGO_URI) {
            console.error('ERROR: MONGO_URI not found in environment variables.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database successfully!');

        console.log(`Preparing to seed ${districts.length} warehouse users...`);

        for (const district of districts) {
            const email = `warehouse.${district.toLowerCase().replace(/\s+/g, '')}@tnimpact.com`;

            // Check if user already exists
            const existingUser = await User.findOne({ email });

            if (!existingUser) {
                await User.create({
                    name: `${district} Warehouse`,
                    email: email,
                    password: 'password@123',
                    role: 'warehouse'
                });
                console.log(`✅ User created for ${district}`);
            } else {
                console.log(`⚠️ User already exists for ${district} (${email})`);
            }
        }

        console.log('\n✨ Database seeding for District Warehouse users finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEEDING ERROR:', error.message);
        process.exit(1);
    }
};

seedWarehouseUsers();
