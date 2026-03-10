import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Settings, User, Bell, Shield, Database, Cpu, Globe, Moon, Save } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Admin Profile', icon: <User size={18} /> },
        { id: 'system', label: 'Logistics Engine', icon: <Cpu size={18} /> },
        { id: 'security', label: 'Security & Auth', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Alert Config', icon: <Bell size={18} /> },
    ];

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>System <span>Settings</span></h1>
                        <p className="subtitle">Configure admin preferences and logistics engine parameters.</p>
                    </div>
                    <button className="primary-btn pulse-glow flex items-center gap-2">
                        <Save size={18} /> Save All Changes
                    </button>
                </header>

                <div className="settings-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                    <div className="settings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tabs.map(tab => (
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
                                    transition: 'var(--transition)',
                                    textAlign: 'left',
                                    fontWeight: activeTab === tab.id ? '600' : '500'
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="settings-content dashboard-card" style={{ padding: '2rem' }}>
                        {activeTab === 'profile' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px dashed var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={40} className="text-accent" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>Guru Vishnu</h3>
                                        <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Super Admin • Registered Mar 2026</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Display Name</label>
                                        <input type="text" defaultValue="Guru Vishnu" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" defaultValue="admin@impact.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
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
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 900px) {
                    .settings-container { grid-template-columns: 1fr !important; }
                    .settings-sidebar { flex-direction: row !important; overflow-x: auto; padding-bottom: 1rem; }
                    .settings-sidebar button { white-space: nowrap; }
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
