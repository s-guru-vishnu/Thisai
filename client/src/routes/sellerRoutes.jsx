import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SellerDashboard from '../dashboards/SellerDashboard';
import SellerDeliveries from '../dashboards/SellerDeliveries';

const SellerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<SellerDashboard />} />
            <Route path="/deliveries" element={<SellerDeliveries />} />
        </Routes>
    );
};

export default SellerRoutes;
