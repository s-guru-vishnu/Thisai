import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
=======
import axios from 'axios';
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f
import Navbar from '../components/Navbar';
import { User, ClipboardList, Link, Eye, Shield, Palette, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

<<<<<<< HEAD
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
=======
const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userInfo, setUserInfo] = useState({});
    const [formData, setFormData] = useState({ name: '', email: '', location: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setUserInfo(data);
        setFormData({
            name: data.name || '',
            email: data.email || '',
            location: data.location || ''
        });
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.put(`${apiBase}/api/auth/profile`, formData, config);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUserInfo(data);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: `${(userInfo.role || 'User').charAt(0).toUpperCase() + (userInfo.role || 'user').slice(1)} Profile`, icon: <User size={18} /> },
        { id: 'system', label: 'Logistics Engine', icon: <Cpu size={18} /> },
        { id: 'security', label: 'Security & Auth', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Alert Config', icon: <Bell size={18} /> },
    ];
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
<<<<<<< HEAD
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
=======
                <header className="dashboard-header">
                    <div>
                        <h1>User <span>Profile</span></h1>
                        <p className="subtitle">Manage your account preferences and system configurations.</p>
                    </div>
                    <button onClick={handleSave} disabled={loading} className="primary-btn pulse-glow flex items-center gap-2">
                        <Save size={18} /> {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                </header>

                <div className="settings-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                    <div className="settings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tabs.map(tab => (
                            <button
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f
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

<<<<<<< HEAD
                    {/* Content Area */}
                    <div className="settings-content dashboard-card" style={{ padding: '2.5rem', minHeight: '600px' }}>
                        {activeTab === 'basic-info' && <BasicInfoSettings userContext={userInfo} />}
                        {activeTab === 'profile-details' && <ProfileDetailsSettings userContext={userInfo} />}
                        {activeTab === 'platform' && <PlatformSettings userContext={userInfo} />}
                        {activeTab === 'visibility' && <VisibilitySettings userContext={userInfo} />}
                        {activeTab === 'accounts' && <AccountsSettings userContext={userInfo} />}
                        {activeTab === 'appearance' && <AppearanceSettings userContext={userInfo} />}
=======
                    <div className="settings-content dashboard-card" style={{ padding: '2rem' }}>
                        {activeTab === 'profile' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px dashed var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={40} className="text-accent" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{userInfo.name || 'User'}</h3>
                                        <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0', textTransform: 'capitalize' }}>{userInfo.role || 'Guest'} Role</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Display Name</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Origin Location / Base Address (Important for Dispatching)</label>
                                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. 123 Main St, Coimbatore Hub" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>AI Tracking Frequency</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Real-time updates for active drivers (every 5 seconds).</p>
                                    </div>
                                    <input type="checkbox" defaultChecked style={{ width: '40px', height: '20px' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>Smart Routing Engine</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Automatically suggest alternate routes during traffic surges.</p>
                                    </div>
                                    <input type="checkbox" defaultChecked style={{ width: '40px', height: '20px' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>Eco-Mode Dispatching</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Prioritize electric vehicles for short-range deliveries.</p>
                                    </div>
                                    <input type="checkbox" style={{ width: '40px', height: '20px' }} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <button className="secondary-btn" style={{ width: 'fit-content' }}>Change Password</button>
                                <button className="secondary-btn" style={{ width: 'fit-content' }}>Two-Factor Authentication (Disabled)</button>
                                <button className="secondary-btn" style={{ width: 'fit-content', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Revoke All Active Sessions</button>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Browser Push Notifications</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Email Alert on Critical Delay (&gt;1h)</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Weekly Analytics Report</span>
                                    <input type="checkbox" />
                                </div>
                            </div>
                        )}
>>>>>>> 325c4039c10287285b4dcd647c557890aca4518f
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
