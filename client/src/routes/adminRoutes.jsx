import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../dashboards/AdminDashboard';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            {/* Add more admin-specific routes here (e.g. /admin/users, /admin/settings) */}
        </Routes>
    );
};

export default AdminRoutes;
