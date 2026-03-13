import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DriverMap from '../components/DriverMap';
import { Truck, MapPin, Navigation, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../styles/dashboard.css';

const DriverDashboard = () => {
    const [map, setMap] = useState(null);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [driverLocation, setDriverLocation] = useState({ lat: 12.9341, lng: 79.1367 });
    const [warehouseLocation, setWarehouseLocation] = useState(null);
    const [routingPhase, setRoutingPhase] = useState("PICKUP"); // PICKUP or DELIVERY
    const [nextETA, setNextETA] = useState("-");
    const [targetLabel, setTargetLabel] = useState("");
    const [liveSpeed, setLiveSpeed] = useState(0);
    const [heading, setHeading] = useState("N");
    const [driverStatus, setDriverStatus] = useState("NOT_STARTED");
    const [driverName, setDriverName] = useState("Driver");
    const [warehouseName, setWarehouseName] = useState("Hub");
    const [driverAddress, setDriverAddress] = useState("");
    const [warehouseAddress, setWarehouseAddress] = useState("");
    const [weatherAlert, setWeatherAlert] = useState(null);
    const [trafficAlerts, setTrafficAlerts] = useState([]);
    const [isWeatherSafe, setIsWeatherSafe] = useState(true);
    const [isTrafficClear, setIsTrafficClear] = useState(true);
    const locationRef = useRef(driverLocation);

    // Stage 1: Dynamic GPS Streaming Engine
    useEffect(() => {
        if (!navigator.geolocation) return;

        const driverId = '69b11da377e9b9ba50767c50';
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await axios.post(`${apiBase}/api/driver/location`, {
                        driverId,
                        lat: latitude,
                        lng: longitude,
                        timestamp: position.timestamp
                    });
                } catch (err) {
                    console.error("GPS_STREAM_ERR:", err);
                }
            },
            (err) => console.warn("GEOLOC_ERR:", err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        locationRef.current = driverLocation;
    }, [driverLocation]);

    // Live Weather Polling
    useEffect(() => {
        const fetchWeatherAlerts = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                const { lat, lng } = locationRef.current;
                const res = await axios.get(`${apiBase}/api/weather/live?lat=${lat}&lng=${lng}`);
                if (res.data) {
                    let alertString = `☀ Clear weather — optimal travel`;
                    let iconColor = "#00cc66";
                    if (res.data.riskLevel === 'HIGH') {
                        alertString = `⚠ Severe weather detected near route: ${res.data.weatherDescription}`;
                        iconColor = "#ff3333";
                    } else if (res.data.riskLevel === 'MEDIUM') {
                        alertString = `🌬 High wind/weather warning: ${res.data.weatherDescription}`;
                        iconColor = "#ffaa00";
                    }
                    setWeatherAlert({ message: alertString, color: iconColor });
                }
            } catch (err) {
                console.error('Failed to fetch live weather:', err);
                setWeatherAlert({ message: '⚠ Weather API Offline', color: '#555' });
            }
        };
        fetchWeatherAlerts();
        const weatherInterval = setInterval(fetchWeatherAlerts, 60000);
        return () => clearInterval(weatherInterval);
    }, []);

    useEffect(() => {
        const fetchDriverData = async () => {
            const driverId = '69b11da377e9b9ba50767c50';
            const apiBase = 'http://localhost:5000';
            try {
                const routeRes = await axios.get(`${apiBase}/api/driver/optimized-route/${driverId}`);
                if (routeRes.data && routeRes.data.optimizedStopSequence) {
                    setActiveDeliveries(routeRes.data.optimizedStopSequence || []);
                    setRoutingPhase(routeRes.data.routingPhase || "PICKUP");
                    setWarehouseLocation(routeRes.data.warehouseLocation);
                    setNextETA(routeRes.data.nextActionETA || "-");
                    setTargetLabel(routeRes.data.targetLabel || "");
                    setLiveSpeed(routeRes.data.liveSpeed || 0);
                    setHeading(routeRes.data.heading || "N");
                    setDriverStatus(routeRes.data.driverStatus || "NOT_STARTED");
                    setWarehouseAddress(routeRes.data.warehouseAddress || "Logistics Hub");
                    setDriverName(routeRes.data.driverName || "Driver");
                    setWarehouseName(routeRes.data.warehouseName || "Hub");

                    if (routeRes.data.driverLocation) {
                        setDriverLocation(routeRes.data.driverLocation);
                        locationRef.current = routeRes.data.driverLocation;
                    }
                    if (routeRes.data.trafficAlerts) setTrafficAlerts(routeRes.data.trafficAlerts);
                    if (routeRes.data.isWeatherSafe !== undefined) setIsWeatherSafe(routeRes.data.isWeatherSafe);
                    if (routeRes.data.isTrafficClear !== undefined) setIsTrafficClear(routeRes.data.isTrafficClear);
                }
            } catch (err) {
                console.error("Dashboard Sync Error:", err);
            }
        };
        fetchDriverData();
        const interval = setInterval(fetchDriverData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMapLoad = (mapInstance) => {
        setMap(mapInstance);
    };

    const stats = [
        { label: 'Pickup Status', value: '1', color: 'orange', icon: Clock },
        { label: 'Active Stops', value: activeDeliveries.length, color: 'var(--accent)', icon: Truck },
        { label: 'Cleared Today', value: '0', color: '#00cc66', icon: CheckCircle },
        { label: 'Shift Progress', value: '0%', color: '#3399ff', icon: Navigation }
    ];

    return (
        <div className="app-container" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />

            <main className="main-content" style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, padding: 0 }}>
                {/* Left Panel: Delivery Feed */}
                <div style={{ width: '400px', background: 'var(--panel-bg)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1.5rem' }}>
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

                    <h3 style={{ fontSize: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Navigation size={18} /> Active Route
                        </div>
                        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.7rem' }}>↻ REFRESH</button>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Driver Current Location */}
                        <div style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,102,0,0.1)', border: '1px solid rgba(255,102,0,0.3)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <Navigation size={14} color="var(--accent)" />
                                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold' }}>CURRENT DRIVER: {driverName.toUpperCase()}</span>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{driverAddress || "Active Tracking..."}</h4>
                        </div>

                        {/* Warehouse Hub */}
                        <div style={{ padding: '15px', borderRadius: '12px', background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.3)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <MapPin size={14} color="#3399ff" />
                                <span style={{ fontSize: '0.7rem', color: '#3399ff', fontWeight: 'bold' }}>SOURCE HUB: {warehouseName.toUpperCase()}</span>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{warehouseAddress}</h4>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                        {activeDeliveries.map((del, idx) => (
                            <div key={del.id} onClick={() => map?.panTo(del.location)} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(0,255,102,0.05)', border: '1px solid rgba(0,255,102,0.15)', cursor: 'pointer', transition: '0.2s transform' }} className="delivery-card-mini">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#00cc66', fontWeight: 'bold' }}>STOP {idx + 1} ({del.trackingCode})</span>
                                    <span style={{ fontSize: '0.7rem', background: '#00cc66', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>IN TRANSIT</span>
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{del.productName}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <MapPin size={14} /> {del.addressLabel || 'Final Destination'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Live Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <DriverMap 
                        driverLocation={driverLocation} 
                        warehouseLocation={warehouseLocation} 
                        stops={activeDeliveries} 
                        onMapLoad={handleMapLoad}
                        driverName={driverName}
                        warehouseName={warehouseName}
                    />

                    {/* Phase Bubble */}
                    {routingPhase === "PICKUP" && (
                        <div style={{ position: 'absolute', top: '70px', left: '20px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 11 }}>
                            <div style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '1px' }}>ROUTING PHASE</div>
                            <div style={{ background: 'rgba(0,0,0,0.8)', padding: '8px 15px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Truck size={16} color="var(--accent)" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>GOING TO PICKUP</span>
                                <div style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                            </div>
                        </div>
                    )}

                    {/* Overlay: Current Speed / Heading / Dynamic ETA */}
                    <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '15px', border: '1px solid var(--accent)', color: 'white', display: 'flex', gap: '20px', backdropFilter: 'blur(10px)', zIndex: 12 }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>SPEED</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                {driverStatus === 'STOPPED' ? 'Idle' : liveSpeed} <span style={{ fontSize: '0.8rem' }}>KM/H</span>
                            </div>
                        </div>
                        <div style={{ width: '1px', background: '#333' }}></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>HEADING</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{heading}</div>
                        </div>
                        <div style={{ width: '1px', background: '#333' }}></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>{targetLabel || 'ETA'}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {nextETA}
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '30px', border: `1px solid ${isTrafficClear && isWeatherSafe ? 'var(--accent)' : '#ff3333'}`, color: 'white', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none', zIndex: 10 }}>
                        <div style={{ width: '8px', height: '8px', background: isTrafficClear && isWeatherSafe ? 'var(--accent)' : '#ff3333', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                        {isTrafficClear && isWeatherSafe ? 'ROUTE HEALTHY — TRAFFIC & WEATHER CLEAR' : 'ROUTE ADAPTATION ACTIVE — SAFETY FIRST'}
                    </div>

                    {weatherAlert && (
                        <div style={{ position: 'absolute', top: '70px', right: '20px', background: 'rgba(0,0,0,0.85)', padding: '12px 20px', borderRadius: '30px', border: `1px solid ${weatherAlert.color}`, color: 'white', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none', zIndex: 10, boxShadow: `0 4px 15px ${weatherAlert.color}44` }}>
                            <div style={{ fontWeight: 'bold', color: weatherAlert.color }}>
                                {weatherAlert.message}
                            </div>
                        </div>
                    )}

                    {trafficAlerts && trafficAlerts.length > 0 && (
                        <div style={{ position: 'absolute', top: weatherAlert ? '120px' : '70px', right: '20px', background: 'rgba(255,50,50,0.85)', padding: '12px 20px', borderRadius: '30px', border: '1px solid #ff3333', color: 'white', display: 'flex', alignItems: 'flex-start', gap: '10px', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 15px rgba(255,50,50,0.3)', flexDirection: 'column' }}>
                            {trafficAlerts.map((alert, i) => (
                                <div key={i} style={{ fontWeight: 'bold' }}>⚠ {alert}</div>
                            ))}
                        </div>
                    )}
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
