import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { User, ClipboardList, Link, Eye, Shield, Palette, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import all sub-components (stubs or actual)
import BasicInfoSettings from '../components/settings/BasicInfoSettings';
import ProfileDetailsSettings from '../components/settings/ProfileDetailsSettings';
import PlatformSettings from '../components/settings/PlatformSettings';
import VisibilitySettings from '../components/settings/VisibilitySettings';
import AccountsSettings from '../components/settings/AccountsSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';

const ProfilePage = ({ initialTab = 'basic-info' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const navigate = useNavigate();

    useEffect(() => {
        // Keep URL in sync with tab clicks
        navigate(`/settings/${activeTab}`, { replace: true });
    }, [activeTab, navigate]);

    // Role-based Layout Definitions
    // Everyone sees Basic Info and Accounts. Admins/Managers see Platform/Visibility.
    const availableTabs = [
        { id: 'basic-info', label: 'Basic Info', icon: <User size={18} />, allowed: true },
        { id: 'profile-details', label: 'Profile Details', icon: <ClipboardList size={18} />, allowed: userInfo.role !== 'customer' },
        { id: 'platform', label: 'Platform', icon: <Link size={18} />, allowed: userInfo.role === 'admin' || userInfo.role === 'manager' || userInfo.role === 'warehouse' || userInfo.role === 'seller' },
        { id: 'visibility', label: 'Visibility', icon: <Eye size={18} />, allowed: userInfo.role === 'admin' || userInfo.role === 'manager' || userInfo.role === 'seller' || userInfo.role === 'warehouse' },
        { id: 'accounts', label: 'Accounts', icon: <Shield size={18} />, allowed: true },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} />, allowed: true } // Removed admin restriction on appearance for now
    ].filter(tab => tab.allowed);

    // Redirect fallback if accessing a disallowed route
    useEffect(() => {
        if (!availableTabs.find(tab => tab.id === activeTab)) {
            setActiveTab('basic-info');
        }
    }, [activeTab, availableTabs]);

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <div className="settings-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '2rem' }}>
                    
                    {/* Sidebar */}
                    <div className="settings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        
                        <div style={{ marginBottom: '1.5rem', padding: '0 10px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Settings</h2>
                        </div>
                        
                        <button 
                            onClick={() => navigate('/dashboard')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', textAlign: 'left', fontWeight: '500', marginBottom: '1rem'
                            }}>
                            <ArrowLeft size={16} /> Back to Profile
                        </button>

                        {availableTabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
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
                    <div className="settings-content dashboard-card" style={{ padding: '2.5rem', minHeight: '600px' }}>
                        {activeTab === 'basic-info' && <BasicInfoSettings userContext={userInfo} />}
                        {activeTab === 'profile-details' && <ProfileDetailsSettings userContext={userInfo} />}
                        {activeTab === 'platform' && <PlatformSettings userContext={userInfo} />}
                        {activeTab === 'visibility' && <VisibilitySettings userContext={userInfo} />}
                        {activeTab === 'accounts' && <AccountsSettings userContext={userInfo} />}
                        {activeTab === 'appearance' && <AppearanceSettings userContext={userInfo} />}
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
