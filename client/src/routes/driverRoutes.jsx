import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InterWarehouseDashboard from '../dashboards/InterWarehouseDashboard';
import DeliveryDriverDashboard from '../dashboards/DeliveryDriverDashboard';
import DriverDashboard from '../dashboards/DriverDashboard';
import VehicleDetails from '../dashboards/VehicleDetails';

const DriverRoutes = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const role = userInfo.role;

    const renderDashboard = () => {
        if (role === 'cargo_driver') return <InterWarehouseDashboard />;
        if (role === 'delivery_driver') return <DeliveryDriverDashboard />;
        return <DriverDashboard />;
    };

    return (
        <Routes>
            <Route path="/" element={renderDashboard()} />
            <Route path="/vehicle" element={<VehicleDetails />} />
        </Routes>
    );
};

export default DriverRoutes;
