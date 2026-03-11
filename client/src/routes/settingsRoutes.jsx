import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';

const SettingsRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="basic-info" />} />
            <Route path="basic-info" element={<ProfilePage initialTab="basic-info" />} />
            <Route path="profile-details" element={<ProfilePage initialTab="profile-details" />} />
            <Route path="platform" element={<ProfilePage initialTab="platform" />} />
            <Route path="visibility" element={<ProfilePage initialTab="visibility" />} />
            <Route path="accounts" element={<ProfilePage initialTab="accounts" />} />
            <Route path="appearance" element={<ProfilePage initialTab="appearance" />} />
        </Routes>
    );
};

export default SettingsRoutes;
