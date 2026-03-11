import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';

const SettingsRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="basic-info" replace />} />
            <Route path=":tab" element={<ProfilePage />} />
        </Routes>
    );
};

export default SettingsRoutes;
