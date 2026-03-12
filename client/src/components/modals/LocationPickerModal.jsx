import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { X, MapPin, CheckCircle, Search } from 'lucide-react';

const LocationPickerModal = ({ isOpen, onClose, onConfirm, initialLocation }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const defaultPos = { lat: 11.0168, lng: 76.9558 };
    const [markerPosition, setMarkerPosition] = useState(initialLocation || defaultPos);
    const [addressPreview, setAddressPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState(initialLocation || defaultPos);
    const mapRef = useRef(null);

    const formatCoords = (pos) => `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)} (current address)`;

    const reverseGeocode = useCallback(async (lat, lng) => {
        setLoading(true);
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
            const data = await res.json();
            if (data.results && data.results[0]) {
                setAddressPreview(data.results[0].formatted_address);
            } else {
                setAddressPreview(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
        } catch {
            setAddressPreview(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // When modal opens or initialLocation changes, update marker AND map center
    useEffect(() => {
        if (isOpen) {
            const pos = initialLocation || defaultPos;
            setMarkerPosition(pos);
            setMapCenter(pos);
            setAddressPreview(null);

            // Also pan the map ref if it exists
            if (mapRef.current) {
                mapRef.current.panTo(pos);
                mapRef.current.setZoom(17);
            }
        }
    }, [isOpen, initialLocation]);

    const onMarkerDragEnd = (e) => {
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkerPosition(newPos);
        reverseGeocode(newPos.lat, newPos.lng);
    };

    const onMapClick = useCallback((e) => {
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkerPosition(newPos);
        reverseGeocode(newPos.lat, newPos.lng);
    }, [reverseGeocode]);

    const displayAddress = loading
        ? 'Fetching precise address...'
        : (addressPreview || formatCoords(markerPosition));

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
                zIndex: 9998,
            }} onClick={onClose} />

            {/* Modal */}
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999, width: '90vw', maxWidth: '640px',
                background: '#1a1a2e', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                animation: 'modalPop 0.25s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)',
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>📍 Pick Your Location</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#888' }}>Tap on the map or drag the red pin</p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none', color: '#aaa', cursor: 'pointer',
                        borderRadius: '50%', width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Map */}
                <div style={{ height: '350px' }}>
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={mapCenter}
                            zoom={17}
                            onLoad={map => {
                                mapRef.current = map;
                                map.panTo(markerPosition);
                                map.setZoom(17);
                            }}
                            onClick={onMapClick}
                            options={{
                                disableDefaultUI: true,
                                zoomControl: true,
                                mapTypeId: 'hybrid',
                            }}
                        >
                            <MarkerF
                                position={markerPosition}
                                draggable={true}
                                onDragEnd={onMarkerDragEnd}
                            />
                        </GoogleMap>
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                            Loading map...
                        </div>
                    )}
                </div>

                {/* Address Preview + Actions */}
                <div style={{ padding: '20px 24px', background: '#12122a' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.04)', padding: '14px 16px', borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px',
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                    }}>
                        <MapPin size={18} style={{ color: '#ff6b6b', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {addressPreview ? 'Selected Address' : 'Current Coordinates'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.92rem', color: '#ddd', lineHeight: 1.4, fontFamily: addressPreview ? 'inherit' : 'monospace' }}>
                                {displayAddress}
                            </p>
                        </div>
                        {!addressPreview && !loading && (
                            <button onClick={() => reverseGeocode(markerPosition.lat, markerPosition.lng)} style={{
                                background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)',
                                color: '#ff6b6b', borderRadius: '8px', padding: '6px 12px',
                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                <Search size={12} /> Fetch
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} style={{
                            flex: 1, padding: '13px', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                            color: '#aaa', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                        }}>Cancel</button>
                        <button
                            onClick={() => onConfirm(markerPosition, addressPreview || formatCoords(markerPosition))}
                            disabled={loading}
                            style={{
                                flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                                background: loading ? '#555' : 'var(--accent)', color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 700, fontSize: '0.95rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}
                        >
                            <CheckCircle size={18} /> Use This Location
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modalPop {
                    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </>
    );
};

export default LocationPickerModal;
