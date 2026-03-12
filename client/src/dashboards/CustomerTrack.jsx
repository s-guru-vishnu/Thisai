import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { PackageX, MapPin, Truck, Package, Clock, Phone, AlertTriangle, Route, User, ShieldCheck } from 'lucide-react';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    minHeight: '400px'
};

const darkModeStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

const CustomerTrack = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const trackingId = searchParams.get('id');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const [parcelData, setParcelData] = useState(null);
    const [driverPos, setDriverPos] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [countdown, setCountdown] = useState(30);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    // Fetch Initial Data
    useEffect(() => {
        if (!trackingId) {
            setLoading(false);
            return;
        }

        const fetchParcelData = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                // Fetch parcel info
                const { data: pData } = await axios.get(`${apiBase}/api/parcel/${trackingId}`, config);
                setParcelData(pData);
                setDriverPos(pData.driverLocation);

                // Fetch AI prediction
                const { data: pPredict } = await axios.get(`${apiBase}/api/predict/delay/${trackingId}`, config);
                setPrediction(pPredict);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Parcel not found or network error.');
                setLoading(false);
            }
        };

        fetchParcelData();
    }, [trackingId, userInfo.token]);

    // Live Driver Location Polling
    useEffect(() => {
        if (!trackingId || !parcelData || parcelData.status === 'Delivered') return;

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const interval = setInterval(async () => {
            try {
                const { data } = await axios.get(`${apiBase}/api/parcel/live-location/${trackingId}`, config);
                if (data && data.driverLocation) {
                    setDriverPos(data.driverLocation);
                }
            } catch (err) {
                console.error('Polling error', err);
            }
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [trackingId, parcelData, userInfo.token]);

    // Live ETA Countdown Update
    useEffect(() => {
        if (!trackingId || !parcelData || parcelData.status === 'Delivered') return;

        const cInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) return 30;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(cInterval);
    }, [trackingId, parcelData]);

    if (loading) {
        return (
            <div className="app-container">
                <Navbar />
                <div style={{ padding: '5rem', textAlign: 'center' }}>
                    <div className="loader">Loading tracking details...</div>
                </div>
            </div>
        );
    }

    if (!trackingId || error || !parcelData) {
        return (
            <div className="app-container">
                <Navbar />
                <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="dashboard-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem', border: '1px dashed var(--border-color)' }}>
                            <PackageX size={64} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>No Parcel Coming</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                            {error || "No tracking ID provided or parcel not found in our system."}
                        </p>
                        <button onClick={() => navigate('/customer')} className="primary-btn pulse-glow">
                            Go to Scanner
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Default map center somewhere between driver and destination if both exist
    const defaultCenter = driverPos || { lat: 13.0827, lng: 80.2707 };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1>Live <span>Tracking</span></h1>
                        <p className="subtitle">Real-time updates for tracking ID: {trackingId}</p>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    
                    {/* Left Column: Information */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Parcel Info Card */}
                        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ background: 'var(--accent)', color: 'white', padding: '12px', borderRadius: '12px' }}>
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{parcelData.productName}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tracking: <span style={{ color: 'white', fontWeight: 'bold' }}>{parcelData.trackingId}</span></p>
                                    </div>
                                </div>
                                <div className="status-badge" style={{
                                    background: parcelData.status === 'Delivered' ? 'rgba(0,204,102,0.1)' : 'rgba(255,165,0,0.1)',
                                    color: parcelData.status === 'Delivered' ? 'var(--success)' : 'orange',
                                    padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold'
                                }}>
                                    {parcelData.status}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <User size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                                    <div>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sender</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{parcelData.senderName}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <Route size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                                    <div>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pickup Location</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{parcelData.pickupLocation}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <MapPin size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                                    <div>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery Address</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{parcelData.deliveryAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Driver & ETA Card */}
                        <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShieldCheck size={24} style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Driver</p>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{parcelData.driverName}</p>
                                    </div>
                                </div>
                                <button className="secondary-btn" style={{ padding: '8px 15px', display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                                    <Phone size={16} /> Contact
                                </button>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Clock size={20} style={{ color: 'var(--warning)' }} />
                                    <div>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live ETA</p>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>{parcelData.eta}</p>
                                    </div>
                                </div>
                                {parcelData.status !== 'Delivered' && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next update in</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent)' }}>{countdown}s</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Prediction Card */}
                        {prediction && (
                            <div className="dashboard-card" style={{ padding: '1.5rem', background: prediction.delayRisk === 'HIGH' ? 'rgba(255,59,48,0.05)' : prediction.delayRisk === 'MEDIUM' ? 'rgba(255,165,0,0.05)' : 'var(--bg-panel)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                    <AlertTriangle size={20} style={{ color: prediction.delayRisk === 'HIGH' ? 'var(--danger)' : prediction.delayRisk === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }} />
                                    <h4 style={{ margin: 0 }}>AI Delay Prediction</h4>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Risk Level</span>
                                    <span style={{ fontWeight: 'bold', color: prediction.delayRisk === 'HIGH' ? 'var(--danger)' : prediction.delayRisk === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }}>
                                        {prediction.delayRisk}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Est. Delay</span>
                                    <span style={{ fontWeight: 'bold' }}>{prediction.delayMinutes} mins</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reason</span>
                                    <span style={{ fontSize: '0.85rem' }}>{prediction.reason}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Status Timeline */}
                        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1.5rem 0' }}>Shipment Timeline</h4>
                            <div className="timeline-container" style={{ position: 'relative', paddingLeft: '20px' }}>
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '8px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                                {parcelData.timeline && parcelData.timeline.map((step, idx) => (
                                    <div key={idx} style={{ position: 'relative', zIndex: 1, marginBottom: idx === parcelData.timeline.length - 1 ? 0 : '1.5rem', display: 'flex', gap: '15px' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: step.completed ? 'var(--success)' : 'var(--bg-panel)', border: `2px solid ${step.completed ? 'var(--success)' : 'var(--border-color)'}`, marginTop: '2px', marginLeft: '-9px' }}></div>
                                        <div>
                                            <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: step.completed ? 'white' : 'var(--text-muted)' }}>{step.title}</p>
                                            {step.time && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.time}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Map */}
                    <div className="dashboard-card" style={{ padding: '1rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: '0 0 1rem 0', padding: '0 10px' }}>Live Driver View</h4>
                        <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={defaultCenter}
                                    zoom={13}
                                    options={{ styles: darkModeStyles, disableDefaultUI: true, zoomControl: true }}
                                >
                                    {/* Driver Marker */}
                                    {driverPos && (
                                        <Marker
                                            position={driverPos}
                                            icon={{
                                                path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
                                                fillColor: '#FF6B00',
                                                fillOpacity: 1,
                                                strokeWeight: 0,
                                                scale: 1.5,
                                                anchor: new window.google.maps.Point(12, 12)
                                            }}
                                            onClick={() => setSelectedMarker('driver')}
                                        />
                                    )}

                                    {selectedMarker === 'driver' && driverPos && (
                                        <InfoWindow position={driverPos} onCloseClick={() => setSelectedMarker(null)}>
                                            <div style={{ color: '#111', padding: '8px' }}>
                                                <h4 style={{ margin: '0 0 5px 0' }}>Driver</h4>
                                                <p style={{ margin: 0, fontSize: '12px' }}>Updating location...</p>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                                    <div className="loader">Loading Map...</div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CustomerTrack;
