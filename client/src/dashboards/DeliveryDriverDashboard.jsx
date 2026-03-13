import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DriverMap from '../components/DriverMap';
import { Truck, MapPin, Navigation, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/dashboard.css';

const DeliveryDriverDashboard = () => {
    const [map, setMap] = useState(null);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [driverLocation, setDriverLocation] = useState({ lat: 11.0168, lng: 76.9558 });
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    useEffect(() => {
        const fetchDriverData = async () => {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const driverId = userInfo._id;
            if (!driverId) return;

            try {
                const routeRes = await axios.get(`${apiBase}/api/driver/route/${driverId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                if (routeRes.data && routeRes.data.stops) {
                    setActiveDeliveries(routeRes.data.stops);
                }
            } catch (err) {
                console.error("API Fetch Error", err);
            }
        };

        fetchDriverData();
        const interval = setInterval(fetchDriverData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleMapLoad = (mapInstance) => {
        setMap(mapInstance);
    };

    const stats = [
        { label: 'Orders Today', value: '15', color: 'var(--accent)', icon: Clock },
        { label: 'Out for Delivery', value: activeDeliveries.length, color: 'var(--accent)', icon: Truck },
        { label: 'Successful', value: '12', color: '#00cc66', icon: CheckCircle },
        { label: 'Re-delivery', value: '0', color: '#ff3333', icon: AlertCircle }
    ];

    return (
        <div className="app-container" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />
            <main className="main-content" style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, padding: 0 }}>
                <div style={{ width: '400px', background: 'var(--panel-bg)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1.5rem' }}>
                    <header style={{ marginBottom: '2rem' }}>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Delivery <span>Terminal</span></h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Warehouse-to-Customer Last Mile active.</p>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
                        {stats.map((s, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,102,0,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,102,0,0.1)' }}>
                                <div style={{ color: s.color, marginBottom: '5px' }}><s.icon size={18} /></div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ fontSize: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Navigation size={18} /> Delivery Checklist
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeDeliveries.map(del => (
                            <div key={del.id} onClick={() => map?.panTo(del.location)} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,102,0,0.05)', border: '1px solid rgba(255,102,0,0.15)', cursor: 'pointer' }} className="delivery-card-mini">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#ffaa00', fontWeight: 'bold' }}>DLV-{del.trackingCode || '334' }</span>
                                    <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>ASSIGNED</span>
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{del.productName || 'Personal Parcel'}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <MapPin size={14} /> {del.destination || 'Customer Address'}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div 
                        onClick={() => window.location.href = '/settings/addresses'}
                        style={{ 
                            marginTop: '2rem',
                            padding: '15px', 
                            borderRadius: '12px', 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    >
                        <div style={{ background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Delivery Locations</h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#888' }}>Quick access to delivery points.</p>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <DriverMap driverLocation={driverLocation} stops={activeDeliveries} onMapLoad={handleMapLoad} />
                    <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '15px', border: '1px solid var(--accent)', color: 'white', display: 'flex', gap: '20px', backdropFilter: 'blur(10px)' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>CITY DRIVE</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>35 <span style={{ fontSize: '0.8rem' }}>KM/H</span></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeliveryDriverDashboard;
