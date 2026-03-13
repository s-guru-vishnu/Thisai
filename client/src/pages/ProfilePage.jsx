import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { User, ClipboardList, Link, Eye, Shield, Palette, ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Import all sub-components (stubs or actual)
import BasicInfoSettings from '../components/settings/BasicInfoSettings';
import ProfileDetailsSettings from '../components/settings/ProfileDetailsSettings';
import PlatformSettings from '../components/settings/PlatformSettings';
import VisibilitySettings from '../components/settings/VisibilitySettings';
import AccountsSettings from '../components/settings/AccountsSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import AddressSettings from '../components/settings/AddressSettings';
import SkeletonLoader from '../components/SkeletonLoader';
import Toast from '../components/Toast';

const ProfilePage = () => {
    const { tab: activeTab } = useParams();
    const [tabLoading, setTabLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo') || '{}'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const { data } = await axios.get(`${apiBase}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                if (data) {
                    const updated = { ...userInfo, ...data };
                    setUserInfo(updated);
                    localStorage.setItem('userInfo', JSON.stringify(updated));
                }
            } catch (err) {
                console.error("Failed to fetch fresh profile:", err);
            }
        };

        const handleSync = () => {
            const fresh = JSON.parse(localStorage.getItem('userInfo') || '{}');
            setUserInfo(fresh);
        };

        window.addEventListener('userInfoChanged', handleSync);
        window.addEventListener('storage', handleSync);
        
        fetchProfile();
        
        return () => {
            window.removeEventListener('userInfoChanged', handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleTabChange = (tabId) => {
        if (tabId === activeTab) return;
        setTabLoading(true);
        navigate(`/settings/${tabId}`);
        setTimeout(() => setTabLoading(false), 400); // Smooth snap loading
    };

    // Role-based Dashboard Path Mapper
    const getDashboardPath = () => {
        const role = userInfo.role;
        if (role === 'admin') return '/dashboard';
        if (role === 'manager') return '/manager';
        if (role === 'driver') return '/driver';
        if (role === 'customer') return '/customer';
        if (role === 'parcel_receiver') return '/receiver';
        if (role === 'seller') return '/seller';
        return '/dashboard'; // Default fallback
    };

    // Role-based Layout Definitions
    const availableTabs = [
        { id: 'basic-info', label: 'Basic Info', icon: <User size={18} />, allowed: true },
        { id: 'profile-details', label: 'Profile Details', icon: <ClipboardList size={18} />, allowed: userInfo.role !== 'customer' },
        { id: 'visibility', label: 'Visibility', icon: <Eye size={18} />, allowed: userInfo.role === 'manager' || userInfo.role === 'seller' || userInfo.role === 'warehouse' },
        { id: 'accounts', label: 'Accounts', icon: <Shield size={18} />, allowed: true },
        { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} />, allowed: true },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} />, allowed: true }
    ].filter(tab => tab.allowed);

    // Redirect fallback if accessing a disallowed route or invalid tab
    useEffect(() => {
        if (!activeTab || !availableTabs.find(tab => tab.id === activeTab)) {
            navigate('/settings/basic-info', { replace: true });
        }
    }, [activeTab, navigate, availableTabs]);

    return (
        <div className="app-container">
            <Navbar />
            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="main-content">
                <div className="settings-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '2rem' }}>
                    
                    {/* Sidebar */}
                    <div className="settings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        
                        <div style={{ marginBottom: '1.5rem', padding: '0 10px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Settings</h2>
                        </div>
                        
                        <button 
                            onClick={() => navigate(getDashboardPath())}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', textAlign: 'left', fontWeight: '500', marginBottom: '1rem'
                            }}>
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>

                        {availableTabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: activeTab === tab.id ? 'var(--bg-panel)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s, color 0.2s',
                                    textAlign: 'left',
                                    fontWeight: activeTab === tab.id ? '600' : '500'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="settings-content dashboard-card" style={{ padding: '2.5rem', minHeight: '600px', position: 'relative' }}>
                        {tabLoading ? (
                            <SkeletonLoader />
                        ) : (
                            <>
                                {activeTab === 'basic-info' && <BasicInfoSettings userContext={userInfo} showToast={showToast} />}
                                {activeTab === 'profile-details' && <ProfileDetailsSettings userContext={userInfo} showToast={showToast} />}
                                {activeTab === 'platform' && <PlatformSettings userContext={userInfo} showToast={showToast} />}
                                {activeTab === 'visibility' && <VisibilitySettings userContext={userInfo} showToast={showToast} />}
                                {activeTab === 'accounts' && <AccountsSettings userContext={userInfo} showToast={showToast} />}
                                {activeTab === 'addresses' && <AddressSettings userContext={userInfo} showToast={showToast} />}
                                {activeTab === 'appearance' && <AppearanceSettings userContext={userInfo} showToast={showToast} />}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 900px) {
                    .settings-container { grid-template-columns: 1fr !important; }
                    .settings-sidebar { flex-direction: row !important; overflow-x: auto; padding-bottom: 1rem; }
                    .settings-sidebar button { white-space: nowrap; flex: 1; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;
