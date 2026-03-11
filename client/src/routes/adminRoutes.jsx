import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../dashboards/AdminDashboard';
import UsersPage from '../pages/UsersPage';
import ParcelsPage from '../pages/ParcelsPage';
import DriversPage from '../pages/DriversPage';
import LiveMapPage from '../pages/LiveMapPage';
import PredictionsPage from '../pages/PredictionsPage';
import ProfilePage from '../pages/ProfilePage';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/parcels" element={<ParcelsPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/map" element={<LiveMapPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
        </Routes>
    );
};

export default AdminRoutes;
