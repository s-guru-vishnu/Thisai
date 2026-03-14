import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DriverMap from '../components/DriverMap';
import { 
    Truck, MapPin, Navigation, Clock, CheckCircle, 
    AlertCircle, BarChart3, Package, Shield, 
    Thermometer, Fuel, Gauge, ArrowRightLeft,
    QrCode, Zap, Settings2, Save, X, Maximize2, Minimize2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import '../styles/dashboard.css';

const InterWarehouseDashboard = () => {
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [driverLocation, setDriverLocation] = useState({ lat: 11.0168, lng: 76.9558 }); // Default Coimbatore
    const [stats, setStats] = useState({
        totalWeight: '4.2 Tons',
        parcels: 124,
        nextHub: 'Salem Hub',
        etaMinutes: 45,
        fuelLevel: 78,
        engineTemp: 82
    });

    const [vehicle, setVehicle] = useState(() => {
        const saved = localStorage.getItem('cargo_vehicle_info');
        return saved ? JSON.parse(saved) : {
            model: 'Eicher 2095xp',
            capacity: '6 Tons',
            regNumber: 'TN-38-BZ-2024'
        };
    });
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);
    const [editForm, setEditForm] = useState({ ...vehicle });
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFocusMode, setIsFocusMode] = useState(searchParams.get('focus') === 'true');

    useEffect(() => {
        const handleFocusToggle = (e) => {
            setIsFocusMode(e.detail);
            setSearchParams(prev => {
                if (e.detail) prev.set('focus', 'true');
                else prev.delete('focus');
                return prev;
            });
        };
        window.addEventListener('toggle-focus-mode', handleFocusToggle);
        return () => window.removeEventListener('toggle-focus-mode', handleFocusToggle);
    }, [setSearchParams]);

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
                // Mock data for cargo feel if API fails
                setActiveDeliveries([
                    { id: 'H1', productName: 'Logistics Batch A-90', destination: 'Salem Regional Hub', location: { lat: 11.6643, lng: 78.1460 }, trackingCode: 'HUB-SA-01' },
                    { id: 'H2', productName: 'Bulk Electronics P4', destination: 'Chennai Central Hub', location: { lat: 13.0827, lng: 80.2707 }, trackingCode: 'HUB-CH-04' }
                ]);
            }
        };

        fetchDriverData();
        const interval = setInterval(fetchDriverData, 15000);
        return () => clearInterval(interval);
    }, [userInfo._id, userInfo.token]);

    const cargoStats = [
        { label: 'Payload', value: stats.totalWeight, icon: BarChart3, color: '#3b82f6' },
        { label: 'Units', value: stats.parcels, icon: Package, color: '#8b5cf6' },
        { label: 'Next Hub', value: stats.nextHub, icon: MapPin, color: '#10b981' },
        { label: 'Gate Pass', value: 'Verified', icon: Shield, color: '#f59e0b' }
    ];

    return (
        <div className="app-container" style={{ 
            background: '#09090b', 
            minHeight: '100vh', 
            color: '#fafafa',
            '--accent': '#3b82f6',
            '--accent-glow': 'rgba(59, 130, 246, 0.25)',
            overflow: 'hidden'
        }}>
            {!isFocusMode && <Navbar />}
            
            <main className="main-content" style={{ 
                display: 'flex', 
                height: isFocusMode ? '100vh' : 'calc(100vh - 70px)', 
                gap: 0, 
                padding: 0, 
                maxWidth: 'none', 
                margin: 0,
                position: 'relative'
            }}>
                
                {/* Left Sidebar: Logistics Control */}
                {!isFocusMode && (
                    <div style={{ 
                        width: '420px', 
                        background: '#121214', 
                        borderRight: '1px solid #27272a', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        padding: '1.5rem',
                        overflowY: 'auto'
                    }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                            padding: '10px', 
                            borderRadius: '12px',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                        }}>
                            <Truck color="white" size={24} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                                CARGO<span style={{ color: '#3b82f6' }}>CORE</span>
                            </h1>
                            <p style={{ margin: 0, color: '#71717a', fontSize: '0.8rem', fontWeight: '500' }}>INTER-HUB LOGISTICS LOG</p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '2rem' }}>
                        {cargoStats.map((s, idx) => (
                            <div key={idx} style={{ 
                                background: '#18181b', 
                                padding: '15px', 
                                borderRadius: '16px', 
                                border: '1px solid #27272a',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ color: s.color, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <s.icon size={16} />
                                    <span style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 'bold' }}>{s.label}</span>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Vehicle Selection / Info */}
                    <div style={{ 
                        background: '#18181b', 
                        padding: '20px', 
                        borderRadius: '20px', 
                        border: '1px solid #27272a',
                        marginBottom: '2rem',
                        position: 'relative'
                    }}>
                        {!isEditingVehicle ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>ACTIVE VEHICLE</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#3b82f6' }}>{vehicle.model}</div>
                                    </div>
                                    <button 
                                        onClick={() => setIsEditingVehicle(true)}
                                        style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}
                                    >
                                        <Settings2 size={18} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#71717a' }}>MAX CAPACITY</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{vehicle.capacity}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#71717a' }}>REG NUMBER</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{vehicle.regNumber}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>VEHICLE MODEL</label>
                                    <input 
                                        type="text" 
                                        value={editForm.model} 
                                        onChange={e => setEditForm({...editForm, model: e.target.value})}
                                        style={{ width: '100%', background: '#09090b', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>CAPACITY</label>
                                        <input 
                                            type="text" 
                                            value={editForm.capacity} 
                                            onChange={e => setEditForm({...editForm, capacity: e.target.value})}
                                            style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>REG NO</label>
                                        <input 
                                            type="text" 
                                            value={editForm.regNumber} 
                                            onChange={e => setEditForm({...editForm, regNumber: e.target.value})}
                                            style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <button 
                                        onClick={() => {
                                            setVehicle(editForm);
                                            localStorage.setItem('cargo_vehicle_info', JSON.stringify(editForm));
                                            setIsEditingVehicle(false);
                                        }}
                                        style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <Save size={16} /> Save Specs
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingVehicle(false)}
                                        style={{ padding: '10px', background: '#27272a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Navigation size={18} /> ROUTE MANIFEST
                            </h3>
                            <span style={{ fontSize: '0.7rem', color: '#71717a' }}>{activeDeliveries.length} Hub Stops</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {activeDeliveries.map((del, idx) => (
                                <div key={del.id} style={{ 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    background: idx === 0 ? 'rgba(59, 130, 246, 0.08)' : '#18181b', 
                                    border: idx === 0 ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #27272a',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}>
                                    {idx === 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6' }}></div>}
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.7rem', color: idx === 0 ? '#3b82f6' : '#71717a', fontWeight: 'bold' }}>
                                            {del.trackingCode || `HUB-TR-${idx}`}
                                        </span>
                                        <span style={{ 
                                            fontSize: '0.65rem', 
                                            background: idx === 0 ? '#3b82f6' : '#27272a', 
                                            color: 'white', 
                                            padding: '2px 8px', 
                                            borderRadius: '20px', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {idx === 0 ? 'NEXT HUB' : 'SCHEDULED'}
                                        </span>
                                    </div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>{del.productName || 'Inter-Hub Batch'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <MapPin size={12} /> {del.destination}
                                    </p>
                                    
                                    {idx === 0 && (
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button style={{ 
                                                flex: 1, 
                                                padding: '10px', 
                                                borderRadius: '10px', 
                                                background: '#3b82f6', 
                                                color: 'white', 
                                                border: 'none', 
                                                fontSize: '0.8rem', 
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                cursor: 'pointer'
                                            }}>
                                                <QrCode size={16} /> Hub Check-in
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vehicle Telemetry */}
                    <div style={{ marginTop: 'auto', background: '#18181b', padding: '20px', borderRadius: '20px', border: '1px solid #27272a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <Zap size={16} color="#fbbf24" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SYSTEM HEALTH</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#71717a', marginBottom: '5px' }}>
                                    <span>FUEL LEVEL</span>
                                    <span>{stats.fuelLevel}%</span>
                                </div>
                                <div style={{ height: '4px', background: '#27272a', borderRadius: '2px' }}>
                                    <div style={{ width: `${stats.fuelLevel}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#71717a', marginBottom: '5px' }}>
                                    <span>ENGINE TEMP</span>
                                    <span>{stats.engineTemp}°C</span>
                                </div>
                                <div style={{ height: '4px', background: '#27272a', borderRadius: '2px' }}>
                                    <div style={{ width: `${(stats.engineTemp/120)*100}%`, height: '100%', background: '#ef4444', borderRadius: '2px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

                {/* Right Panel: High-Tech Map View */}
                <div style={{ flex: 1, position: 'relative', background: '#09090b' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
                        <DriverMap driverLocation={driverLocation} stops={activeDeliveries} />
                    </div>

                    {/* HUD Overlays */}
                    <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '16px', zIndex: 100 }}>
                        <div style={{ 
                            background: 'rgba(9, 9, 11, 0.85)', 
                            backdropFilter: 'blur(12px)', 
                            padding: '12px 20px', 
                            borderRadius: '16px', 
                            border: '1px solid #27272a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>HUB NETWORK LINK ACTIVE</span>
                        </div>

                        {/* Focus Mode Exit Toggle (Floating) */}
                        {isFocusMode && (
                            <button 
                                onClick={() => {
                                    setIsFocusMode(false);
                                    window.dispatchEvent(new CustomEvent('toggle-focus-mode', { detail: false }));
                                }}
                                style={{ 
                                    background: 'rgba(59, 130, 246, 0.2)', 
                                    backdropFilter: 'blur(12px)', 
                                    padding: '12px 20px', 
                                    borderRadius: '16px', 
                                    border: '1px solid #3b82f6',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                  }}
                            >
                                <Minimize2 size={18} /> EXIT FOCUS
                            </button>
                        )}
                    </div>

                    <div style={{ 
                        position: 'absolute', 
                        bottom: '32px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        background: 'rgba(9, 9, 11, 0.9)', 
                        backdropFilter: 'blur(20px)', 
                        padding: '24px 40px', 
                        borderRadius: '24px', 
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        display: 'flex',
                        gap: '48px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '4px', fontWeight: 'bold' }}>SPEED</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6' }}>72 <span style={{ fontSize: '0.9rem', color: '#71717a' }}>KM/H</span></div>
                        </div>
                        <div style={{ width: '1px', background: '#27272a' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '4px', fontWeight: 'bold' }}>NEXT HUB ETA</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.etaMinutes} <span style={{ fontSize: '0.9rem', color: '#71717a' }}>MIN</span></div>
                        </div>
                        <div style={{ width: '1px', background: '#27272a' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '4px', fontWeight: 'bold' }}>COMPLETED</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>75<span style={{ fontSize: '0.9rem', color: '#71717a' }}>%</span></div>
                        </div>
                    </div>

                    {/* Compass / Orientation */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '32px', 
                        right: '32px',
                        width: '80px',
                        height: '80px',
                        background: 'rgba(9, 9, 11, 0.8)',
                        borderRadius: '50%',
                        border: '1px solid #27272a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Navigation size={32} color="#3b82f6" style={{ transform: 'rotate(45deg)' }} />
                    </div>
                </div>
            </main>

            <style>{`
                ::-webkit-scrollbar {
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </div>
    );
};

export default InterWarehouseDashboard;
