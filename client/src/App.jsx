import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

import AdminRoutes from './routes/adminRoutes';
import ManagerRoutes from './routes/managerRoutes';
import WarehouseRoutes from './routes/warehouseRoutes';
import DriverRoutes from './routes/driverRoutes';
import CustomerRoutes from './routes/customerRoutes';
import ParcelReceiverRoutes from './routes/parcelReceiverRoutes';
import SellerRoutes from './routes/sellerRoutes';
import SettingsRoutes from './routes/settingsRoutes';

function App() {
    useEffect(() => {
        const userInfoRaw = localStorage.getItem('userInfo');
        if (userInfoRaw) {
            try {
                const userInfo = JSON.parse(userInfoRaw);
                const prefs = userInfo.preferences;
                if (prefs && prefs.accentColor) {
                    document.documentElement.style.setProperty('--accent', prefs.accentColor);
                    document.documentElement.style.setProperty('--accent-glow', `${prefs.accentColor}40`);
                    document.documentElement.style.setProperty('--border-accent', `${prefs.accentColor}66`); // 40% opacity
                }
                if (prefs && prefs.theme) {
                    const savedTheme = prefs.theme;
                    if (savedTheme === 'dark') {
                        document.body.classList.add('dark-mode');
                        document.body.classList.remove('light-mode');
                    } else if (savedTheme === 'light') {
                        document.body.classList.add('light-mode');
                        document.body.classList.remove('dark-mode');
                    } else {
                        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            document.body.classList.add('dark-mode');
                        } else {
                            document.body.classList.add('light-mode');
                        }
                    }
                }
            } catch(e) {}
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />

                {/* Role-based Independent Routers */}
                <Route path="/dashboard/*" element={<AdminRoutes />} />
                <Route path="/manager/*" element={<ManagerRoutes />} />
                <Route path="/warehouse/*" element={<WarehouseRoutes />} />
                <Route path="/driver/*" element={<DriverRoutes />} />
                <Route path="/customer/*" element={<CustomerRoutes />} />
                <Route path="/receiver/*" element={<ParcelReceiverRoutes />} />
                <Route path="/seller/*" element={<SellerRoutes />} />
                
                {/* Universal Settings Route */}
                <Route path="/settings/*" element={<SettingsRoutes />} />
            </Routes>
        </Router>
    );
}

export default App;
