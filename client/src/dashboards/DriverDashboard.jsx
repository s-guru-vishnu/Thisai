import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DriverMap from '../components/DriverMap';
import { Truck, MapPin, Navigation, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../styles/dashboard.css';

const DriverDashboard = () => {
    const [map, setMap] = useState(null);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [driverLocation, setDriverLocation] = useState({ lat: 11.0168, lng: 76.9558 });
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // Routing state
    const [driverName, setDriverName] = useState(userInfo.name || 'Driver');
    const [driverAddress, setDriverAddress] = useState('');
    const [warehouseName, setWarehouseName] = useState('Central Hub');
    const [warehouseAddress, setWarehouseAddress] = useState('Loading...');
    const [warehouseLocation, setWarehouseLocation] = useState({ lat: 11.0168, lng: 76.9558 });
    const [routingPhase, setRoutingPhase] = useState('DELIVERY');
    const [liveSpeed, setLiveSpeed] = useState(0);
    const [heading, setHeading] = useState('N');
    const [nextETA, setNextETA] = useState('-');
    const [driverStatus, setDriverStatus] = useState('NOT_STARTED');
    const [targetLabel, setTargetLabel] = useState('ETA');
    const [isTrafficClear, setIsTrafficClear] = useState(true);
    const [isWeatherSafe, setIsWeatherSafe] = useState(true);
    const [weatherAlert, setWeatherAlert] = useState(null);
    const [trafficAlerts, setTrafficAlerts] = useState([]);

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
                    if (routeRes.data.stops.length > 0) {
                        setDriverLocation(routeRes.data.stops[0].location);
                    }
                }
                try {
                    const optRes = await axios.get(`${apiBase}/api/driver/optimized-route/${driverId}`, {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    });
                    const opt = optRes.data;
                    if (opt) {
                        if (opt.driverLocation) setDriverLocation(opt.driverLocation);
                        if (opt.warehouseLocation) setWarehouseLocation(opt.warehouseLocation);
                        if (opt.driverName) setDriverName(opt.driverName);
                        if (opt.warehouseAddress) setWarehouseAddress(opt.warehouseAddress);
                        if (opt.warehouseName) setWarehouseName(opt.warehouseName);
                        if (opt.routingPhase) setRoutingPhase(opt.routingPhase);
                        if (opt.liveSpeed !== undefined) setLiveSpeed(opt.liveSpeed);
                        if (opt.heading) setHeading(opt.heading);
                        if (opt.nextActionETA) setNextETA(opt.nextActionETA);
                        if (opt.driverStatus) setDriverStatus(opt.driverStatus);
                        if (opt.targetLabel) setTargetLabel(opt.targetLabel);
                        if (opt.optimizedStopSequence) setActiveDeliveries(opt.optimizedStopSequence);
                    }
                } catch (optErr) {
                    console.warn("Optimized route not available:", optErr.message);
                }
            } catch (err) {
                console.error("Dashboard Sync Error:", err);
                const saved = localStorage.getItem('sellerDeliveries');
                if (saved) {
                    try {
                        const allDels = JSON.parse(saved);
                        if (Array.isArray(allDels)) {
                            setActiveDeliveries(allDels.map(d => ({ ...d, status: 'In Transit' })));
                        }
                    } catch (e) { console.error("Fallback parse error:", e); }
                }
            }
        };
        fetchDriverData();
        const interval = setInterval(fetchDriverData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setDriverAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                },
                () => { setDriverAddress('GPS unavailable'); }
            );
        }
    }, []);

    const handleMapLoad = (mapInstance) => { setMap(mapInstance); };

    const stats = [
        { label: 'Pickup Status', value: routingPhase === 'PICKUP' ? 'Active' : 'Done', color: 'var(--warning)', icon: Clock },
        { label: 'Active Stops', value: activeDeliveries.length, color: 'var(--accent)', icon: Truck },
        { label: 'Cleared Today', value: '0', color: 'var(--success)', icon: CheckCircle },
        { label: 'Shift Progress', value: driverStatus === 'NOT_STARTED' ? '0%' : 'Active', color: 'var(--info)', icon: Navigation }
    ];

    return (
        <div className="app-container">
            <Navbar />

            <main className="driver-main">
                {/* Left Panel */}
                <div className="driver-sidebar">
                    <header className="driver-sidebar-header">
                        <h1>Driver <span>Terminal</span></h1>
                        <p>Real-time route optimization active.</p>
                    </header>

                    <div className="driver-stats-grid">
                        {stats.map((s, idx) => (
                            <div key={idx} className="driver-stat-card">
                                <div className="driver-stat-icon" style={{ color: s.color }}><s.icon size={18} /></div>
                                <div className="driver-stat-value">{s.value}</div>
                                <div className="driver-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <h3 className="driver-section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Navigation size={18} /> Active Route
                        </div>
                        <button onClick={() => window.location.reload()} className="driver-refresh-btn">↻ REFRESH</button>
                    </h3>

                    <div className="driver-feed">
                        {/* Driver Location Card */}
                        <div className="driver-location-card driver">
                            <div className="driver-location-label">
                                <Navigation size={14} />
                                <span>CURRENT DRIVER: {driverName.toUpperCase()}</span>
                            </div>
                            <h4>{driverAddress || "Active Tracking..."}</h4>
                        </div>

                        {/* Warehouse Card */}
                        <div className="driver-location-card warehouse">
                            <div className="driver-location-label warehouse">
                                <MapPin size={14} />
                                <span>SOURCE HUB: {warehouseName.toUpperCase()}</span>
                            </div>
                            <h4>{warehouseAddress}</h4>
                        </div>

                        <div className="driver-divider"></div>

                        {activeDeliveries.map((del, idx) => (
                            <div key={del.id || idx} onClick={() => map?.panTo(del.location)} className="driver-stop-card">
                                <div className="driver-stop-header">
                                    <span className="driver-stop-label">STOP {idx + 1} ({del.trackingCode})</span>
                                    <span className="driver-stop-badge">IN TRANSIT</span>
                                </div>
                                <h4>{del.productName}</h4>
                                <p><MapPin size={14} /> {del.addressLabel || 'Final Destination'}</p>
                            </div>
                        ))}
                    </div>

                    <div className="driver-address-link" onClick={() => window.location.href = '/settings/addresses'}>
                        <div className="driver-address-icon"><MapPin size={20} /></div>
                        <div>
                            <h4>Managed Locations</h4>
                            <p>Quick access to saved addresses.</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Map */}
                <div className="driver-map-panel">
                    <DriverMap 
                        driverLocation={driverLocation} 
                        warehouseLocation={warehouseLocation} 
                        stops={activeDeliveries} 
                        onMapLoad={handleMapLoad}
                        driverName={driverName}
                        warehouseName={warehouseName}
                    />

                    {routingPhase === "PICKUP" && (
                        <div className="driver-phase-bubble">
                            <div className="driver-phase-label">ROUTING PHASE</div>
                            <div className="driver-phase-content">
                                <Truck size={16} />
                                <span>GOING TO PICKUP</span>
                                <div className="driver-pulse-dot"></div>
                            </div>
                        </div>
                    )}

                    <div className="driver-telemetry">
                        <div className="driver-telemetry-item">
                            <div className="driver-telemetry-label">SPEED</div>
                            <div className="driver-telemetry-value accent">
                                {driverStatus === 'STOPPED' ? 'Idle' : liveSpeed} <span>KM/H</span>
                            </div>
                        </div>
                        <div className="driver-telemetry-divider"></div>
                        <div className="driver-telemetry-item">
                            <div className="driver-telemetry-label">HEADING</div>
                            <div className="driver-telemetry-value">{heading}</div>
                        </div>
                        <div className="driver-telemetry-divider"></div>
                        <div className="driver-telemetry-item">
                            <div className="driver-telemetry-label">{targetLabel || 'ETA'}</div>
                            <div className="driver-telemetry-value">{nextETA}</div>
                        </div>
                    </div>

                    <div className={`driver-route-status ${isTrafficClear && isWeatherSafe ? 'healthy' : 'alert'}`}>
                        <div className="driver-pulse-dot"></div>
                        {isTrafficClear && isWeatherSafe ? 'ROUTE HEALTHY — TRAFFIC & WEATHER CLEAR' : 'ROUTE ADAPTATION ACTIVE — SAFETY FIRST'}
                    </div>

                    {weatherAlert && (
                        <div className="driver-weather-alert" style={{ borderColor: weatherAlert.color }}>
                            <div style={{ fontWeight: 'bold', color: weatherAlert.color }}>{weatherAlert.message}</div>
                        </div>
                    )}

                    {trafficAlerts && trafficAlerts.length > 0 && (
                        <div className="driver-traffic-alerts" style={{ top: weatherAlert ? '120px' : '70px' }}>
                            {trafficAlerts.map((alert, i) => (
                                <div key={i} style={{ fontWeight: 'bold' }}>⚠ {alert}</div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .driver-main {
                    display: flex;
                    height: calc(100vh - 64px);
                    gap: 0;
                    padding: 0 !important;
                    max-width: 100% !important;
                }

                .driver-sidebar {
                    width: 400px;
                    min-width: 400px;
                    background: var(--bg-secondary);
                    border-right: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                .driver-sidebar-header h1 {
                    margin: 0;
                    font-size: 1.8rem;
                    color: var(--text-main);
                }
                .driver-sidebar-header h1 span {
                    color: var(--accent);
                }
                .driver-sidebar-header p {
                    margin: 4px 0 0 0;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .driver-stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin: 1.5rem 0;
                }

                .driver-stat-card {
                    background: var(--bg-panel);
                    padding: 15px;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }
                .driver-stat-card:hover {
                    border-color: var(--accent);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .driver-stat-icon { margin-bottom: 5px; }
                .driver-stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--text-main);
                }
                .driver-stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .driver-section-title {
                    font-size: 1rem;
                    color: var(--accent);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 1rem;
                    justify-content: space-between;
                }
                .driver-refresh-btn {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 0.7rem;
                    padding: 4px 10px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .driver-refresh-btn:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                }

                .driver-feed {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .driver-location-card {
                    padding: 15px;
                    border-radius: 12px;
                    transition: all 0.3s;
                }
                .driver-location-card.driver {
                    background: color-mix(in srgb, var(--accent) 10%, transparent);
                    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
                }
                .driver-location-card.warehouse {
                    background: rgba(0,102,255,0.08);
                    border: 1px solid rgba(0,102,255,0.25);
                }
                .driver-location-label {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .driver-location-label span {
                    font-size: 0.7rem;
                    font-weight: bold;
                    color: var(--accent);
                }
                .driver-location-label svg { color: var(--accent); }
                .driver-location-label.warehouse span { color: #3399ff; }
                .driver-location-label.warehouse svg { color: #3399ff; }
                .driver-location-card h4 {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--text-main);
                }

                .driver-divider {
                    height: 1px;
                    background: var(--border-color);
                    margin: 0.5rem 0;
                }

                .driver-stop-card {
                    padding: 15px;
                    border-radius: 12px;
                    background: rgba(22,199,132,0.05);
                    border: 1px solid rgba(22,199,132,0.15);
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .driver-stop-card:hover {
                    transform: translateX(5px);
                    background: color-mix(in srgb, var(--accent) 8%, transparent);
                    border-color: color-mix(in srgb, var(--accent) 30%, transparent);
                }
                .driver-stop-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .driver-stop-label {
                    font-size: 0.8rem;
                    color: var(--success);
                    font-weight: bold;
                }
                .driver-stop-badge {
                    font-size: 0.7rem;
                    background: var(--success);
                    color: #000;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-weight: bold;
                }
                .driver-stop-card h4 {
                    margin: 0 0 5px 0;
                    font-size: 1rem;
                    color: var(--text-main);
                }
                .driver-stop-card p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .driver-address-link {
                    margin-top: 2rem;
                    padding: 15px;
                    border-radius: 12px;
                    background: var(--bg-panel);
                    border: 1px solid var(--border-color);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                }
                .driver-address-link:hover {
                    border-color: var(--accent);
                    transform: translateY(-2px);
                }
                .driver-address-icon {
                    background: color-mix(in srgb, var(--accent) 10%, transparent);
                    color: var(--accent);
                    padding: 8px;
                    border-radius: 10px;
                }
                .driver-address-link h4 {
                    margin: 0;
                    font-size: 0.95rem;
                    color: var(--text-main);
                }
                .driver-address-link p {
                    margin: 2px 0 0 0;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .driver-map-panel {
                    flex: 1;
                    position: relative;
                }

                .driver-phase-bubble {
                    position: absolute;
                    top: 70px;
                    left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    z-index: 11;
                }
                .driver-phase-label {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    letter-spacing: 1px;
                }
                .driver-phase-content {
                    background: rgba(0,0,0,0.8);
                    padding: 8px 15px;
                    border-radius: 8px;
                    border-left: 4px solid var(--accent);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--accent);
                }
                .driver-phase-content span {
                    font-size: 0.9rem;
                    font-weight: bold;
                    color: white;
                }

                .driver-pulse-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: driverPulse 1.5s infinite;
                }
                .driver-route-status .driver-pulse-dot,
                .driver-phase-content .driver-pulse-dot { background: var(--accent); }

                .driver-telemetry {
                    position: absolute;
                    bottom: 30px;
                    left: 30px;
                    background: rgba(0,0,0,0.85);
                    padding: 20px;
                    border-radius: 15px;
                    border: 1px solid var(--accent);
                    color: white;
                    display: flex;
                    gap: 20px;
                    backdrop-filter: blur(10px);
                    z-index: 12;
                }
                .driver-telemetry-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }
                .driver-telemetry-value {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: var(--text-main);
                }
                .driver-telemetry-value.accent {
                    color: var(--accent);
                }
                .driver-telemetry-value span {
                    font-size: 0.8rem;
                }
                .driver-telemetry-divider {
                    width: 1px;
                    background: var(--border-color);
                }

                .driver-route-status {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(0,0,0,0.8);
                    padding: 10px 20px;
                    border-radius: 30px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    pointer-events: none;
                    z-index: 10;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .driver-route-status.healthy {
                    border: 1px solid var(--accent);
                }
                .driver-route-status.healthy .driver-pulse-dot {
                    background: var(--accent);
                }
                .driver-route-status.alert {
                    border: 1px solid var(--danger);
                }
                .driver-route-status.alert .driver-pulse-dot {
                    background: var(--danger);
                }

                .driver-weather-alert {
                    position: absolute;
                    top: 70px;
                    right: 20px;
                    background: rgba(0,0,0,0.85);
                    padding: 12px 20px;
                    border-radius: 30px;
                    border: 1px solid;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    pointer-events: none;
                    z-index: 10;
                }
                .driver-traffic-alerts {
                    position: absolute;
                    right: 20px;
                    background: rgba(255,50,50,0.85);
                    padding: 12px 20px;
                    border-radius: 30px;
                    border: 1px solid var(--danger);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                    z-index: 10;
                }

                @keyframes driverPulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }

                @media (max-width: 1000px) {
                    .driver-main { flex-direction: column; height: auto; }
                    .driver-sidebar { width: 100% !important; min-width: unset; max-height: 50vh; }
                    .driver-map-panel { min-height: 400px; }
                }
            `}</style>
        </div>
    );
};

export default DriverDashboard;
