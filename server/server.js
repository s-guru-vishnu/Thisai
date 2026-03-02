const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Dummy data Endpoints
app.get('/api/stats', (req, res) => {
    res.json({ completed: 850, inProgress: 124, pending: 45 });
});

app.get('/api/fleet', (req, res) => {
    res.json([
        { name: 'Light Vehicles', value: 45 },
        { name: 'Vans', value: 120 },
        { name: 'Trucks', value: 85 }
    ]);
});

app.get('/api/revenue', (req, res) => {
    res.json([
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 5200 },
        { name: 'Mar', revenue: 4800 },
        { name: 'Apr', revenue: 6300 },
        { name: 'May', revenue: 5800 },
        { name: 'Jun', revenue: 8400 },
        { name: 'Jul', revenue: 7600 },
        { name: 'Aug', revenue: 9800 },
    ]);
});

app.get('/api/orders', (req, res) => {
    res.json([
        { id: 'ORD-8901', driver: 'Alex Morgan', pickup: 'Downtown Hub', delivery: 'Northside Clinic', eta: '10:30 AM', status: 'In Progress', predictiveRisk: 12 },
        { id: 'ORD-8902', driver: 'James Chen', pickup: 'West Port', delivery: 'Central Station', eta: '11:15 AM', status: 'Pending', predictiveRisk: 88 },
        { id: 'ORD-8903', driver: 'Sarah Jones', pickup: 'East Storage', delivery: 'Tech Park B', eta: '09:45 AM', status: 'Completed', predictiveRisk: 2 },
        { id: 'ORD-8904', driver: 'Unassigned', pickup: 'Airport Cargo', delivery: 'South District', eta: 'TBD', status: 'Pending', predictiveRisk: 45 },
        { id: 'ORD-8905', driver: 'Mike Tyson', pickup: 'Port 5', delivery: 'Retail City', eta: '02:00 PM', status: 'In Progress', predictiveRisk: 15 },
    ]);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
