const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const regionsMapping = [
    {
        region: 'Western Tamil Nadu',
        hub: 'Coimbatore',
        districts: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'The Nilgiris', 'Nilgiris']
    },
    {
        region: 'Northern Tamil Nadu',
        hub: 'Chennai',
        districts: ['Chennai', 'Thiruvallur', 'Tiruvallur', 'Kancheepuram', 'Kanchipuram', 'Chengalpattu', 'Vellore', 'Ranipet', 'Tirupathur', 'Tirupattur']
    },
    {
        region: 'Central Tamil Nadu',
        hub: 'Trichy',
        districts: ['Tiruchirappalli', 'Trichy', 'Karur', 'Perambalur', 'Ariyalur', 'Thanjavur', 'Pudukkottai', 'Kallakurichi']
    },
    {
        region: 'Southern Tamil Nadu',
        hub: 'Madurai',
        districts: ['Madurai', 'Dindigul', 'Sivagangai', 'Sivaganga', 'Virudhunagar', 'Theni', 'Ramanathapuram', 'Tenkasi']
    },
    {
        region: 'Coastal South/East Tamil Nadu',
        hub: 'Tirunelveli',
        districts: ['Tirunelveli', 'Thoothukkudi', 'Thoothukudi', 'Kanniyakumari', 'Cuddalore', 'Viluppuram', 'Villupuram', 'Nagapattinam', 'Mayiladuthurai', 'Thiruvarur']
    }
];

const seedRegionalWarehouses = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI missing');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database Connected.');

        // Update existing 38 districts with regional context
        // First we clear existing warehouse users to ensure clean mapping if desired, 
        // but better just update based on name/email.

        console.log('Assigning districts to their specific hubs and regions...');

        for (const mapping of regionsMapping) {
            for (const district of mapping.districts) {
                const searchEmail = `warehouse.${district.toLowerCase().replace(/\s+/g, '')}@tnimpact.com`;

                // Update User
                const result = await User.findOneAndUpdate(
                    { email: searchEmail, role: 'warehouse' },
                    {
                        region: mapping.region,
                        hub: mapping.hub
                    },
                    { new: true }
                );

                if (result) {
                    console.log(`✅ [${mapping.hub}] - ${district} mapped to ${mapping.region}`);
                } else {
                    // Try to Create if not found (for the variants)
                    const email = `warehouse.${district.toLowerCase().replace(/\s+/g, '')}@tnimpact.com`;
                    const existing = await User.findOne({ email });
                    if (!existing) {
                        await User.create({
                            name: `${district} Warehouse`,
                            email: email,
                            password: 'password@123',
                            role: 'warehouse',
                            region: mapping.region,
                            hub: mapping.hub
                        });
                        console.log(`🆕 Created and Mapped: ${district}`);
                    }
                }
            }
        }

        console.log('\n✨ Regional Warehouse Mapping Finished.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedRegionalWarehouses();
