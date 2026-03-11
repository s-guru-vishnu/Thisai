import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, TrafficLayer } from '@react-google-maps/api';
import { MapPin, Truck, AlertCircle, Maximize2, Layers } from 'lucide-react';

const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 250px)',
    borderRadius: '16px'
};

const center = {
    lat: 13.0827, // Chennai coordinates
    lng: 80.2707
};

// Dark mode styles for Google Maps
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

const LiveMapPage = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [selectedMarker, setSelectedMarker] = useState(null);
    const [activeDrivers, setActiveDrivers] = useState([]);
    const [liveAlert, setLiveAlert] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [mapInstance, setMapInstance] = useState(null);
    const [showTraffic, setShowTraffic] = useState(false);

    const handleFocusCenter = () => {
        if (mapInstance) {
            mapInstance.panTo(center);
            mapInstance.setZoom(13);
        }
    };

    const toggleTraffic = () => {
        setShowTraffic(!showTraffic);
    };

    React.useEffect(() => {
        const fetchMapData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/live-map');
                if (response.ok) {
                    const data = await response.json();
                    setActiveDrivers(data.activeDrivers);
                    setLiveAlert(data.alert);
                }
            } catch (error) {
                console.error("Error fetching live map data:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchMapData();
        const interval = setInterval(fetchMapData, 15000); // refresh every 15s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>Live <span>Map</span> Overlay</h1>
                        <p className="subtitle">Real-time GPS tracking and transit visualization.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={toggleTraffic} className="primary-btn pulse-glow flex items-center gap-2" style={{ padding: '0 20px', margin: 0, height: '42px', whiteSpace: 'nowrap', display: 'flex', boxSizing: 'border-box' }}>
                            <Layers size={18} /> {showTraffic ? 'Hide Traffic' : 'View Traffic'}
                        </button>
                    </div>
                </header>

                <div className="map-view-container" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
                    <div style={{ position: 'relative', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                        {isLoaded && !loadingData ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={13}
                                onLoad={map => setMapInstance(map)}
                                options={{ styles: darkModeStyles, disableDefaultUI: true, zoomControl: true }}
                            >
                                {showTraffic && <TrafficLayer />}
                                {activeDrivers.map(driver => (
                                    <Marker 
                                        key={driver.id} 
                                        position={driver.pos} 
                                        onClick={() => setSelectedMarker(driver)}
                                        icon={{
                                            path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
                                            fillColor: driver.status === 'Idle' ? '#F7931A' : '#FF6B00',
                                            fillOpacity: 1,
                                            strokeWeight: 0,
                                            scale: 1.5
                                        }}
                                    />
                                ))}

                                {selectedMarker && (
                                    <InfoWindow 
                                        position={selectedMarker.pos} 
                                        onCloseClick={() => setSelectedMarker(null)}
                                    >
                                        <div style={{ color: '#111', padding: '8px' }}>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{selectedMarker.name}</h4>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>{selectedMarker.vehicle}</p>
                                            <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#FF6B0022', color: '#FF6B00', border: '1px solid #FF6B0044' }}>
                                                {selectedMarker.status}
                                            </span>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        ) : (
                            <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="loader">Loading Neural Map Engine...</div>
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(11,11,12,0.85)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div> <span style={{ fontSize: '12px' }}>Active</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }}></div> <span style={{ fontSize: '12px' }}>Idle</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }}></div> <span style={{ fontSize: '12px' }}>Alert</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="map-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} className="text-warning" /> Critical Alerts</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {liveAlert ? (
                                    <div style={{ padding: '10px', background: 'rgba(247,147,26,0.05)', borderLeft: '3px solid var(--warning)', borderRadius: '4px' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{liveAlert.type}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{liveAlert.desc}</div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        No critical alerts present.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="dashboard-card" style={{ padding: '1.5rem', flexGrow: 1 }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Vehicle Feed</h3>
                            <div className="activity-list" style={{ gap: '1rem' }}>
                                {activeDrivers.length > 0 ? activeDrivers.map(d => (
                                    <div key={d.id} className="activity-item" style={{ padding: '10px', background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{d.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.status} • {d.vehicle}</div>
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No active drivers.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveMapPage;
