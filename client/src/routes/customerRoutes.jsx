import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerDashboard from '../dashboards/CustomerDashboard';

const CustomerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<CustomerDashboard />} />
            {/* Add more customer-specific routes here */}
        </Routes>
    );
};

export default CustomerRoutes;
