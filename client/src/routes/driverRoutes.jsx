import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DriverDashboard from '../dashboards/DriverDashboard';

const DriverRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DriverDashboard />} />
            {/* Add more driver-specific routes here */}
        </Routes>
    );
};

export default DriverRoutes;
