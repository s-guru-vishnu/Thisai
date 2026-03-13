import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import axios from 'axios';
import LocationEnforcementModal from './components/LocationEnforcementModal';

import AdminRoutes from './routes/adminRoutes';
import ManagerRoutes from './routes/managerRoutes';
import DriverRoutes from './routes/driverRoutes';
import CustomerRoutes from './routes/customerRoutes';
import ParcelReceiverRoutes from './routes/parcelReceiverRoutes';
import SellerRoutes from './routes/sellerRoutes';
import SettingsRoutes from './routes/settingsRoutes';
import LoadingScreen from './components/LoadingScreen';
import NotFoundPage from './pages/NotFoundPage';
import './styles/dashboard.css';

import ChatBot from './components/ChatBot';

function AppContent() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const location = useLocation();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

    const checkLocation = () => {
        // If the user is on the login or register page, don't show the modal
        if (isAuthPage) {
            setShowLocationModal(false);
            return;
        }

        const userInfoRaw = localStorage.getItem('userInfo');
        if (userInfoRaw && userInfoRaw !== 'undefined' && userInfoRaw !== 'null') {
            try {
                if (userInfoRaw && userInfoRaw !== 'undefined' && userInfoRaw !== 'null') {
                    const userInfo = JSON.parse(userInfoRaw);
                    if (userInfo && typeof userInfo === 'object') {
                        const loc = userInfo.location;
                        const hasLocation = loc && (loc.latitude !== null && loc.latitude !== undefined) && (loc.addressLine1 || loc.city);

                        if (!hasLocation && userInfo.role === 'customer') {
                            // User requested to remove this mandatory popup
                            setShowLocationModal(false);
                        } else {
                            setShowLocationModal(false);
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing userInfo:", e);
                setShowLocationModal(false);
            }
        } else {
            setShowLocationModal(false);
        }
    };

    const applyTheme = () => {
        const userInfoRaw = localStorage.getItem('userInfo');
        const standaloneTheme = localStorage.getItem('theme');
        let activeTheme = standaloneTheme;

        if (userInfoRaw && userInfoRaw !== 'undefined' && userInfoRaw !== 'null') {
            try {
                const userInfo = JSON.parse(userInfoRaw);
                if (userInfo && userInfo.preferences) {
                    const prefs = userInfo.preferences;
                    if (prefs.accentColor) {
                        const root = document.documentElement;
                        root.style.setProperty('--accent', prefs.accentColor);
                        root.style.setProperty('--accent-glow', `${prefs.accentColor}40`);
                        root.style.setProperty('--border-accent', `${prefs.accentColor}66`);
                    }
                    
                    // If logged in and no manual override on current session, use prefs
                    if (prefs.theme && !standaloneTheme) {
                        activeTheme = prefs.theme;
                    }
                }
            } catch (e) { }
        }

        if (activeTheme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else if (activeTheme === 'light') {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        } else {
            // OS Default
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
            } else {
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
            }
        }
    };

    const syncProfile = async () => {
        const userInfoRaw = localStorage.getItem('userInfo');
        if (!userInfoRaw || userInfoRaw === 'undefined' || userInfoRaw === 'null') return;

        try {
            const userInfo = JSON.parse(userInfoRaw);
            if (!userInfo.token) return;

            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const { data } = await axios.get(`${apiBase}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if (data) {
                // Merge fresh data with current session token
                const updatedUserInfo = { ...userInfo, ...data };
                try {
                    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                } catch (err) {
                    console.warn("Storage quota exceeded, storing without avatar");
                    const safe = { ...updatedUserInfo };
                    delete safe.avatar;
                    localStorage.setItem('userInfo', JSON.stringify(safe));
                }
                
                // Dispatch event so same-tab components know to update
                window.dispatchEvent(new Event('userInfoChanged'));
                applyTheme(); // Re-apply theme in case preferences changed
            }
        } catch (e) {
            console.error("Profile sync failed:", e.message);
            if (e.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
            }
        }
    };

    useEffect(() => {
        applyTheme();
        syncProfile();
    }, [location.pathname]);

    useEffect(() => {
        // Initial app load simulation for UX
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 1500);

        checkLocation();
        applyTheme();
        syncProfile();

        // Listen for storage changes
        const handleStorageChange = () => {
            checkLocation();
            applyTheme();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearTimeout(timer);
        };
    }, []);

    const handleLocationSaved = () => {
        setShowLocationModal(false);
    };

    if(initialLoading) {
        return <LoadingScreen fullScreen={true} />;
    }

    return (
        <div className="app-main-wrapper">
            {showLocationModal && <LocationEnforcementModal onLocationSaved={handleLocationSaved} />}
            <ChatBot />

            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Role-based Independent Routers */}
                <Route path="/dashboard/*" element={<AdminRoutes />} />
                <Route path="/manager/*" element={<ManagerRoutes />} />
                <Route path="/driver/*" element={<DriverRoutes />} />
                <Route path="/customer/*" element={<CustomerRoutes />} />
                <Route path="/receiver/*" element={<ParcelReceiverRoutes />} />
                <Route path="/seller/*" element={<SellerRoutes />} />

                {/* Universal Settings Route */}
                <Route path="/settings/*" element={<SettingsRoutes />} />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '50px', textAlign: 'center', color: 'white', background: '#0b0b0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: 'var(--accent, #ff6b00)' }}>Something went wrong.</h1>
                    <p>The dashboard encountered a runtime error. Please try refreshing the page.</p>
                    <button onClick={() => window.location.reload()} className="primary-btn" style={{ marginTop: '20px' }}>
                        Refresh Page
                    </button>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="secondary-btn" style={{ marginTop: '10px', maxWidth: '200px' }}>
                        Clear Cache & Logout
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <AppContent />
            </Router>
        </ErrorBoundary>
    );
}

export default App;
