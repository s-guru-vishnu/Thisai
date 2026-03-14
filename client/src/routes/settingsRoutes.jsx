import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

const SettingsRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="basic-info" replace />} />
            <Route path=":tab" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default SettingsRoutes;
