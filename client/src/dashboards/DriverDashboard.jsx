import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DriverMap from '../components/DriverMap';
import { Truck, MapPin, Navigation, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../styles/dashboard.css';

const DriverDashboard = () => {
    const [map, setMap] = useState(null);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [driverLocation, setDriverLocation] = useState({ lat: 11.0168, lng: 76.9558 }); // Default Coimbatore
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    useEffect(() => {
        const fetchDriverData = async () => {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const driverId = userInfo._id;

            if (!driverId) return;

            try {
                // Fetch driver route / stops from assigned parcels
                const routeRes = await axios.get(`${apiBase}/api/driver/route/${driverId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                if (routeRes.data && routeRes.data.stops) {
                    setActiveDeliveries(routeRes.data.stops);
                    // If we have stops, focus on the first one as initial location fallback
                    if (routeRes.data.stops.length > 0 && !driverLocation) {
                        setDriverLocation(routeRes.data.stops[0].location);
                    }
                }
            } catch (err) {
                console.error("API Fetch Error", err);
                // Fallback to local storage or mock
                const saved = localStorage.getItem('sellerDeliveries');
                if (saved) {
                    try {
                        const allDels = JSON.parse(saved);
                        if (Array.isArray(allDels)) {
                            setActiveDeliveries(allDels.map(d => ({ ...d, status: 'In Transit' })));
                        }
                    } catch (e) {
                        console.error("Error parsing fallback deliveries:", e);
                    }
                }
            }
        };

        fetchDriverData();
        const interval = setInterval(fetchDriverData, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleMapLoad = (mapInstance) => {
        setMap(mapInstance);
    };

    const stats = [
        { label: 'Pending Picks', value: '4', color: 'orange', icon: Clock },
        { label: 'In Transit', value: activeDeliveries.length, color: 'var(--accent)', icon: Truck },
        { label: 'Completed Today', value: '12', color: '#00cc66', icon: CheckCircle },
        { label: 'Alerts', value: '0', color: '#ff3333', icon: AlertCircle }
    ];

    return (
        <div className="app-container" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />

            <main className="main-content" style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, padding: 0 }}>
                {/* Left Panel: Delivery Feed */}
                <div style={{ width: '400px', background: 'var(--panel-bg)', p: '2rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1.5rem' }}>
                    <header style={{ marginBottom: '2rem' }}>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Driver <span>Terminal</span></h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time route optimization active.</p>
                    </header>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
                        {stats.map((s, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ color: s.color, marginBottom: '5px' }}><s.icon size={18} /></div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ fontSize: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Navigation size={18} /> Active Route
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeDeliveries.map(del => (
                            <div key={del.id} onClick={() => map?.panTo(del.location)} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,102,0,0.05)', border: '1px solid rgba(255,102,0,0.15)', cursor: 'pointer', transition: '0.2s transform' }} className="delivery-card-mini">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#ffaa00', fontWeight: 'bold' }}>TRK-{del.trackingCode || del.id}</span>
                                    <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>IN TRANSIT</span>
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{del.productName}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <MapPin size={14} /> {del.destination}
                                </p>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    <button style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#333', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}>Map</button>
                                    <button style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: 'black', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>Complete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Live Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <DriverMap driverLocation={driverLocation} stops={activeDeliveries} onMapLoad={handleMapLoad} />

                    {/* Overlay: Current Speed / Heading */}
                    <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '15px', border: '1px solid var(--accent)', color: 'white', display: 'flex', gap: '20px', backdropFilter: 'blur(10px)' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>SPEED</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>45 <span style={{ fontSize: '0.8rem' }}>KM/H</span></div>
                        </div>
                        <div style={{ width: '1px', background: '#333' }}></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>HEADING</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>NE</div>
                        </div>
                        <div style={{ width: '1px', background: '#333' }}></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>ETA</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>12 <span style={{ fontSize: '0.8rem' }}>MIN</span></div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '30px', border: '1px solid var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                        LIVE TRAFFIC DATA SYNCED
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .delivery-card-mini:hover {
                    transform: translateX(5px);
                    background: rgba(255,102,0,0.08) !important;
                }
            `}</style>
        </div>
    );
};

export default DriverDashboard;
