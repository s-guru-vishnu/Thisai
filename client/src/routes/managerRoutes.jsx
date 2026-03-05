import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ManagerDashboard from '../dashboards/ManagerDashboard';

const ManagerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ManagerDashboard />} />
            {/* Add more manager-specific routes here */}
        </Routes>
    );
};

export default ManagerRoutes;
