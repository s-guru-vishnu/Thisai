import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Truck, Star, Phone, MapPin, MoreHorizontal, UserCheck, ShieldCheck, Search, Plus } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const DriversPage = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
                // Fetch all users and filter drivers
                const { data } = await window.axios ? window.axios.get(`${apiBase}/api/admin/users`, config) : await fetch(`${apiBase}/api/admin/users`, config).then(res => res.json());
                const driverUsers = (data || []).filter(u => u.role === 'driver').map(d => ({
                    id: d._id || d.id,
                    name: d.name,
                    vehicle: d.vehicle || 'Unassigned Vehicle',
                    rating: d.rating || 5.0,
                    parcels: d.parcels || 0,
                    status: d.status || 'Offline',
                    phone: d.phone || 'N/A'
                }));
                setDrivers(driverUsers);
            } catch (err) {
                console.error("Failed to fetch drivers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDrivers();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Online': return { color: '#16C784', bg: 'rgba(22,199,132,0.1)' };
            case 'On Delivery': return { color: '#17A2B8', bg: 'rgba(23,162,184,0.1)' };
            case 'Offline': return { color: '#A3A3A3', bg: 'rgba(255,255,255,0.05)' };
            case 'Away': return { color: '#F7931A', bg: 'rgba(247,147,26,0.1)' };
            default: return { color: 'white', bg: 'transparent' };
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Fleet <span>Management</span></h1>
                        <p className="subtitle">Monitor driver performance and vehicle assignments.</p>
                    </div>
                </header>

                <div className="table-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Find drivers by name, ID or vehicle..." 
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'white' }}
                        />
                    </div>
                </div>

                <div className="driver-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <LoadingScreen fullScreen={false} message="Scanning Fleet Status..." />
                        </div>
                    ) : drivers.map((driver) => {
                        const style = getStatusStyle(driver.status);
                        return (
                            <div key={driver.id} className="dashboard-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                                            <Truck size={24} className="text-accent" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{driver.name}</h3>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{driver.id}</span>
                                        </div>
                                    </div>
                                    <span style={{ background: style.bg, color: style.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', border: `1px solid ${style.color}44` }}>
                                        {driver.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={14} /> <span>{driver.vehicle}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <Star size={14} fill="#F7931A" color="#F7931A" /> <span>{driver.rating} Rating • {driver.parcels} Active Parcels</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <Phone size={14} /> <span>{driver.phone}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="primary-btn" style={{ padding: '8px 0', flex: 1, fontSize: '0.9rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>View History</button>
                                    <button className="primary-btn" style={{ padding: '8px 0', flex: 1, fontSize: '0.9rem' }}>Assign Task</button>
                                    <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 8px', color: 'var(--text-muted)' }}><MoreHorizontal size={18} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default DriversPage;
