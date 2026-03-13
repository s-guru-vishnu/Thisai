import React from 'react';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import axios from 'axios';
import { Package, Truck, AlertTriangle, Clock, Bell, RefreshCw, Smartphone, CloudRain, Info, CheckCircle, MapPin } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = React.useState({
        totalParcelsToday: 0,
        activeDrivers: 0,
        predictedDelays: 0,
        avgDeliveryTime: '...',
        aiConfidence: '...',
        onlineSupport: '...',
        serverHealth: '...',
        parcelTrend: '...',
        driverTrend: '...',
        delayTrend: '...',
        avgDeliveryTrend: '...',
        aiTip: 'Initializing AI engine...'
    });
    const [notifications, setNotifications] = React.useState([]);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                
                const [statsRes, notificationsRes] = await Promise.all([
                    axios.get(`${apiBase}/api/admin/dashboard/stats`, config),
                    axios.get(`${apiBase}/api/admin/notifications`, config)
                ]);
                
                setStats(statsRes.data);
                setNotifications(notificationsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Admin <span>Control</span></h1>
                        <p className="subtitle">Real-time overall tracking and delay prediction engine.</p>
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Section 1: Top Notifications & Insights */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }} className="admin-top-section">
                        <div className="activity-panel dashboard-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <Bell size={20} style={{ color: 'var(--accent)' }} />
                                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>System Notifications</h2>
                            </div>
                            <div className="activity-list" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent system notifications.</div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className="activity-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '12px 0' }}>
                                            <div className={`activity-icon ${notif.type}`} style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                                {notif.type === 'warning' ? <AlertTriangle size={18} /> : notif.type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
                                            </div>
                                            <div className="activity-details">
                                                <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>{notif.title}</h4>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{notif.message}</p>
                                            </div>
                                            <span className="activity-time" style={{ fontSize: '0.75rem' }}>{notif.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="quick-stats-panel dashboard-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <RefreshCw size={20} style={{ color: 'var(--success)' }} />
                                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Quick Insights</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
                                <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>AI Confidence</span>
                                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>{stats.aiConfidence}</span>
                                </div>
                                <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Support Online</span>
                                    <span style={{ color: 'var(--info)', fontWeight: '700' }}>{stats.onlineSupport}</span>
                                </div>
                                <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Server Status</span>
                                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>{stats.serverHealth}</span>
                                </div>
                                <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,107,0,0.05)', borderRadius: '12px', border: '1px dashed var(--accent)', display: 'flex', gap: '10px' }}>
                                    <Smartphone size={18} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                                    <div>
                                        <h4 style={{ color: 'var(--accent)', margin: '0 0 4px 0', fontSize: '0.85rem' }}>AI TIP</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                                            {stats.aiTip}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Bottom Metrics Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="admin-bottom-grid">
                        <MetricCard title="Total Parcels Today" value={stats.totalParcelsToday.toLocaleString()} trend={stats.parcelTrend} icon={Package} trendPositive={true} />
                        <MetricCard title="Active Drivers" value={stats.activeDrivers.toLocaleString()} trend={stats.driverTrend} icon={Truck} trendPositive={true} />
                        <MetricCard title="Predicted Delays" value={stats.predictedDelays.toLocaleString()} trend={stats.delayTrend} icon={AlertTriangle} trendPositive={false} />
                        <MetricCard title="Avg. Delivery Time" value={stats.avgDeliveryTime} trend={stats.avgDeliveryTrend} icon={Clock} trendPositive={true} />
                    </div>

                    {/* Section 3: Quick Management */}
                    <div className="dashboard-card" style={{ padding: '1.5rem', background: 'rgba(255,107,0,0.03)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--accent)' }}>System Management</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <div 
                                onClick={() => window.location.href = '/settings/addresses'}
                                style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    padding: '1.25rem', 
                                    borderRadius: '15px', 
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Global Address Book</h4>
                                    <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage your saved system locations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .dashboard-card {
                    backdrop-filter: blur(8px);
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    transition: all 0.3s ease;
                }
                .dashboard-card:hover {
                    border-color: rgba(255,107,0,0.2) !important;
                    box-shadow: 0 12px 24px rgba(0,0,0,0.3);
                }
                .activity-item {
                    transition: background 0.2s ease;
                    border-radius: 8px;
                    padding: 10px !important;
                    margin: 0 -10px;
                }
                .activity-item:hover {
                    background: rgba(255,107,0,0.03);
                }
                .admin-bottom-grid .metric-card {
                    padding: 1.2rem !important;
                    border: 1px solid rgba(255,255,255,0.05) !important;
                    background: rgba(255,255,255,0.02) !important;
                    transition: all 0.3s ease;
                }
                .admin-bottom-grid .metric-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--accent) !important;
                    box-shadow: 0 10px 20px rgba(255,107,0,0.1);
                }
                @media (max-width: 1200px) {
                    .admin-top-section {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 1000px) {
                    .admin-bottom-grid {
                        grid-template-columns: 1fr 1fr !important;
                    }
                }
                @media (max-width: 600px) {
                    .admin-bottom-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
