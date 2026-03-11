import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerDashboard from '../dashboards/CustomerDashboard';
import CustomerTrack from '../dashboards/CustomerTrack';
import CustomerHistory from '../dashboards/CustomerHistory';

const CustomerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="track" element={<CustomerTrack />} />
            <Route path="history" element={<CustomerHistory />} />
        </Routes>
    );
};

export default CustomerRoutes;
