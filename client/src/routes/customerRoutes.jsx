import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerDashboard from '../dashboards/CustomerDashboard';
import CustomerTrack from '../dashboards/CustomerTrack';
import CustomerHistory from '../dashboards/CustomerHistory';
import AddressBook from '../dashboards/AddressBook';
import AddAddress from '../dashboards/AddAddress';
import NotFoundPage from '../pages/NotFoundPage';

const CustomerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="track" element={<CustomerTrack />} />
            <Route path="history" element={<CustomerHistory />} />
            <Route path="addresses" element={<AddressBook />} />
            <Route path="addresses/add" element={<AddAddress />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default CustomerRoutes;
