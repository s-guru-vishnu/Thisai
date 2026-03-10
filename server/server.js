const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const parcelReceiverRoutes = require('./routes/parcelReceiverRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelReceiverRoutes);

app.get('/', (req, res) => {
    res.send('Logistics API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
