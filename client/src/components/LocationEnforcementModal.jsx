import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Search, Navigation, CheckCircle, AlertCircle, Map as MapIcon } from 'lucide-react';
import axios from 'axios';
import '../styles/dashboard.css';

const libraries = ['places'];
const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
};

const LocationEnforcementModal = ({ onLocationSaved }) => {
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [location, setLocation] = useState({ lat: 13.0827, lng: 80.2707 }); // Default Chennai
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const autocompleteRef = useRef(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setLocation({ lat, lng });
            setAddress(place.formatted_address);

            // Extract address components
            place.address_components.forEach(comp => {
                if (comp.types.includes('locality')) setCity(comp.long_name);
                if (comp.types.includes('postal_code')) setPostalCode(comp.long_name);
                if (comp.types.includes('country')) setCountry(comp.long_name);
                if (comp.types.includes('administrative_area_level_1')) setState(comp.long_name);
            });
        }
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            setStatus('Getting location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setLocation({ lat, lng });
                    setStatus('Location acquired!');

                    // Reverse geocoding
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            setAddress(results[0].formatted_address);
                            results[0].address_components.forEach(comp => {
                                if (comp.types.includes('locality')) setCity(comp.long_name);
                                if (comp.types.includes('postal_code')) setPostalCode(comp.long_name);
                                if (comp.types.includes('country')) setCountry(comp.long_name);
                                if (comp.types.includes('administrative_area_level_1')) setState(comp.long_name);
                            });
                        }
                    });
                },
                (err) => {
                    setError('Error getting location: ' + err.message);
                    setStatus('');
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    const handleMarkerDragEnd = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLocation({ lat, lng });

        // Reverse geocoding
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setAddress(results[0].formatted_address);
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!address || !city || !postalCode || !country || !state) {
            setError('All fields are mandatory.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const { data } = await axios.put(`${apiBase}/api/auth/profile`, {
                location: {
                    addressLine1: address,
                    city,
                    state,
                    country,
                    postalCode,
                    latitude: location.lat,
                    longitude: location.lng
                }
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            // Update local storage
            localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, location: data.location }));
            onLocationSaved(data.location);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={headerStyle}>
                    <MapPin size={24} color="var(--accent)" />
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Mandatory Location Enforcement</h2>
                </div>

                {error && (
                    <div style={errorMessageStyle}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSave} style={formStyle}>
                    <div style={leftColumnStyle}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Search / Address Line 1</label>
                            <div style={{ position: 'relative' }}>
                                <Autocomplete
                                    onLoad={(ref) => (autocompleteRef.current = ref)}
                                    onPlaceChanged={handlePlaceChanged}
                                >
                                    <input
                                        type="text"
                                        placeholder="Search your location..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </Autocomplete>
                                <Search size={18} style={searchIconStyle} />
                            </div>
                        </div>

                        <div style={gridStyle}>
                            <div className="form-group">
                                <label style={labelStyle}>City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>Postal Code</label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>Country</label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div className="form-group">
                                <label style={labelStyle}>State / Region</label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleCurrentLocation}
                                style={secondaryBtnStyle}
                            >
                                <Navigation size={18} /> Use My Current Location
                            </button>
                            {status && <p style={{ fontSize: '0.8rem', color: 'var(--accent)', margin: 0 }}>{status}</p>}

                            <button type="submit" disabled={loading} style={primaryBtnStyle}>
                                {loading ? 'Saving...' : 'Mark on Map & Save'}
                            </button>
                        </div>
                    </div>

                    <div style={rightColumnStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>Pin on Map</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>Draggable Marker</span>
                        </div>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={location}
                            zoom={13}
                            options={{
                                styles: darkMapStyle,
                                disableDefaultUI: true,
                                zoomControl: true
                            }}
                        >
                            <Marker
                                position={location}
                                draggable={true}
                                onDragEnd={handleMarkerDragEnd}
                            />
                        </GoogleMap>
                        <div style={coordsStyle}>
                            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(8px)'
};

const modalContentStyle = {
    background: 'var(--bg-panel, #0a0a0a)',
    width: '900px',
    maxWidth: '95%',
    padding: '2.5rem',
    borderRadius: '20px',
    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    zIndex: 10001
};

const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '2rem',
    color: 'white'
};

const formStyle = {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '2.5rem'
};

const leftColumnStyle = {
    display: 'flex',
    flexDirection: 'column'
};

const rightColumnStyle = {
    display: 'flex',
    flexDirection: 'column'
};

const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    color: '#888',
    marginBottom: '8px'
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#111',
    border: '1px solid #222',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s'
};

const searchIconStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#555'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1rem'
};

const secondaryBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    background: 'transparent',
    border: '1px solid var(--accent)',
    color: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background 0.2s'
};

const primaryBtnStyle = {
    padding: '14px',
    background: 'var(--accent)',
    color: 'black',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'transform 0.2s'
};

const coordsStyle = {
    marginTop: '10px',
    fontSize: '0.85rem',
    color: '#666',
    textAlign: 'center'
};

const errorMessageStyle = {
    background: 'rgba(255, 51, 51, 0.1)',
    color: '#ff3333',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem'
};

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
    { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

export default LocationEnforcementModal;
