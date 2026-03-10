import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import Navbar from '../components/Navbar';
import { Truck, MapPin, Navigation, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../styles/dashboard.css';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 13.0827,
    lng: 80.2707
};

const mapOptions = {
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }
    ],
    disableDefaultUI: false,
    zoomControl: true,
};

const DriverDashboard = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const [map, setMap] = useState(null);
    const [directions, setDirections] = useState(null);
    const [activeDeliveries, setActiveDeliveries] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('sellerDeliveries');
        if (saved) {
            const allDels = JSON.parse(saved);
            // Simulate active deliveries for the driver
            setActiveDeliveries(allDels.slice(0, 3).map(d => ({ ...d, status: 'In Transit' })));
        } else {
            // Mock data if empty
            setActiveDeliveries([
                { id: 101, productName: 'MacBook Pro M2', customerName: 'Alice Johnson', destination: 'Guindy Hub', status: 'In Transit', location: { lat: 13.0067, lng: 80.2206 } },
                { id: 102, productName: 'Sony WH-1000XM5', customerName: 'Bob Smith', destination: 'Anna Nagar', status: 'In Transit', location: { lat: 13.0850, lng: 80.2101 } }
            ]);
        }
    }, []);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(function callback(mapInstance) {
        setMap(null);
    }, []);

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
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={12}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={mapOptions}
                        >
                            {/* Marker for Current Driver Position (Simulated) */}
                            <Marker
                                position={center}
                                icon={{
                                    path: "M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z",
                                    fillColor: "#ff6600",
                                    fillOpacity: 1,
                                    strokeColor: "#000",
                                    strokeWeight: 2,
                                    scale: 2
                                }}
                            />

                            {/* Markers for Deliveries */}
                            {activeDeliveries.map(del => (
                                <Marker
                                    key={del.id}
                                    position={del.location}
                                    icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                    onClick={() => map.panTo(del.location)}
                                />
                            ))}
                        </GoogleMap>
                    ) : (
                        <div style={{ height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p>Initializing Cyber Road Map...</p>
                        </div>
                    )}

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
