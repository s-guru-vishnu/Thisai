import React, { useState, useCallback, useRef } from 'react';
import { User, Phone, Globe, Upload, Save, CheckCircle, MapPin, Building, Hash, Crosshair, Search } from 'lucide-react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px',
    marginTop: '1rem'
};

const BasicInfoSettings = ({ userContext, showToast }) => {
    const [loading, setLoading] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const [formData, setFormData] = useState({
        name: userContext.name || '',
        email: userContext.email || '',
        role: userContext.role || '',
        phone: userContext.phone || '',
        timezone: userContext.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatarPreview: userContext.avatar || null,
        companyName: userContext.companyName || '',
        companyType: userContext.companyType || '',
        businessAddress: userContext.businessAddress || '',
        warehouseLocation: userContext.warehouseLocation || '',
        country: userContext.country || '',
        city: userContext.city || '',
        taxId: userContext.taxId || '',
        // New Location Schema
        location: {
            addressLine1: userContext.location?.addressLine1 || '',
            addressLine2: userContext.location?.addressLine2 || '',
            city: userContext.location?.city || '',
            state: userContext.location?.state || '',
            country: userContext.location?.country || '',
            postalCode: userContext.location?.postalCode || '',
            latitude: userContext.location?.latitude || 13.0827, 
            longitude: userContext.location?.longitude || 80.2707,
        },
        liveLocationSharing: userContext.liveLocationSharing || false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [field]: value }
            }));
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("File size exceeds 5MB limit.", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatarPreview: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
        setIsMapLoaded(true);
    }, []);

    const onMarkerDragEnd = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setFormData(prev => ({
            ...prev,
            location: { ...prev.location, latitude: lat, longitude: lng }
        }));
        reverseGeocode(lat, lng);
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry) return;

            const addressComponents = place.address_components;
            let city = '', state = '', country = '', postalCode = '';
            
            addressComponents.forEach(component => {
                const types = component.types;
                if (types.includes('locality')) city = component.long_name;
                if (types.includes('administrative_area_level_1')) state = component.long_name;
                if (types.includes('country')) country = component.long_name;
                if (types.includes('postal_code')) postalCode = component.long_name;
            });

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    addressLine1: place.formatted_address,
                    city,
                    state,
                    country,
                    postalCode,
                    latitude: lat,
                    longitude: lng
                }
            }));

            if (mapRef.current) {
                mapRef.current.panTo({ lat, lng });
                mapRef.current.setZoom(15);
            }
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // We call reverseGeocode first to get address data
                    const addressData = await reverseGeocode(lat, lng);
                    
                    setFormData(prev => ({
                        ...prev,
                        location: { 
                            ...prev.location, 
                            latitude: lat, 
                            longitude: lng,
                            ...addressData
                        }
                    }));

                    if (mapRef.current) {
                        mapRef.current.panTo({ lat, lng });
                        mapRef.current.setZoom(15);
                    }
                },
                () => showToast("Error: Geolocation failed.", "error")
            );
        } else {
            showToast("Error: Browser does not support geolocation.", "error");
        }
    };

    const handleMarkOnMap = async () => {
        if (formData.location.latitude && formData.location.longitude) {
            const addressData = await reverseGeocode(formData.location.latitude, formData.location.longitude);
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    ...addressData
                }
            }));
            showToast("Address updated from map marker", "success");
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
            const data = await response.json();
            if (data.results && data.results[0]) {
                const place = data.results[0];
                const addressComponents = place.address_components;
                let city = '', state = '', country = '', postalCode = '';
                
                addressComponents.forEach(component => {
                    if (component.types.includes('locality')) city = component.long_name;
                    if (component.types.includes('administrative_area_level_1')) state = component.long_name;
                    if (component.types.includes('country')) country = component.long_name;
                    if (component.types.includes('postal_code')) postalCode = component.long_name;
                });

                return {
                    addressLine1: place.formatted_address,
                    city,
                    state,
                    country,
                    postalCode
                };
            }
        } catch (error) {
            console.error("Reverse Geocoding Error:", error);
        }
        return {};
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            const payload = {
                name: formData.name,
                phone: formData.phone,
                timezone: formData.timezone,
                avatar: formData.avatarPreview,
                companyName: formData.companyName,
                companyType: formData.companyType,
                businessAddress: formData.businessAddress,
                warehouseLocation: formData.warehouseLocation,
                country: formData.country,
                city: formData.city,
                taxId: formData.taxId,
                location: formData.location,
                liveLocationSharing: formData.liveLocationSharing
            };

            const { data } = await axios.put(`${apiBase}/api/auth/profile`, payload, config);
            
            localStorage.setItem('userInfo', JSON.stringify({ ...userContext, ...data }));
            showToast('Profile and Location updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
            {/* Header / Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        width: '90px', height: '90px', borderRadius: '50%', 
                        background: 'var(--bg-primary)', border: '2px dashed var(--accent)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                        {formData.avatarPreview ? (
                            <img src={formData.avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={40} className="text-accent" />
                        )}
                    </div>
                    <label style={{ 
                        position: 'absolute', bottom: 0, right: 0, 
                        background: 'var(--accent)', color: 'white', 
                        padding: '6px', borderRadius: '50%', cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        <Upload size={14} />
                        <input type="file" style={{ display: 'none' }} accept=".jpg,.png,.webp" onChange={handleAvatarChange} />
                    </label>
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{formData.name}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0', textTransform: 'capitalize' }}>{formData.role.replace('_', ' ')} Account</p>
                </div>
            </div>

            {/* Core Details */}
            <section>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Personal Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="settings-input settings-input-with-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Email Address (Read-only)</label>
                        <input type="email" value={formData.email} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                    </div>
                    
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="phone" type="text" placeholder="Enter Phone No." value={formData.phone} onChange={handleInputChange} className="settings-input settings-input-with-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Timezone</label>
                        <div style={{ position: 'relative' }}>
                            <Globe size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select name="timezone" value={formData.timezone} onChange={handleInputChange} className="settings-select" style={{ paddingLeft: '45px' }}>
                                <option value="UTC">UTC (Universal Coordinated Time)</option>
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Chicago">Central Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                <option value="Europe/London">London (GMT)</option>
                                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                <option value="Australia/Sydney">Sydney (AEST)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={20} className="text-accent" /> Mandatory Location Enforcement
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    
                    {/* Location Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Search / Address Line 1</label>
                            {isLoaded ? (
                                <Autocomplete onLoad={ref => autocompleteRef.current = ref} onPlaceChanged={onPlaceChanged}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input 
                                            name="location.addressLine1" type="text" 
                                            placeholder="Search your location..." 
                                            value={formData.location.addressLine1} 
                                            onChange={handleInputChange} 
                                            className="settings-input settings-input-with-icon" 
                                        />
                                    </div>
                                </Autocomplete>
                            ) : (
                                <input name="location.addressLine1" type="text" value={formData.location.addressLine1} onChange={handleInputChange} className="settings-input" />
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>City</label>
                                <input name="location.city" type="text" value={formData.location.city} onChange={handleInputChange} className="settings-input" />
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Postal Code</label>
                                <input name="location.postalCode" type="text" value={formData.location.postalCode} onChange={handleInputChange} className="settings-input" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Country</label>
                                <input name="location.country" type="text" value={formData.location.country} onChange={handleInputChange} className="settings-input" />
                            </div>
                            <div className="form-group">
                                <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>State / Region</label>
                                <input name="location.state" type="text" value={formData.location.state} onChange={handleInputChange} className="settings-input" />
                            </div>
                        </div>

                        {formData.role === 'driver' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '10px', border: '1px solid rgba(var(--accent-rgb), 0.2)' }}>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ margin: 0, color: 'white' }}>Live Location Sharing</h5>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Allow live GPS tracking during active deliveries.</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    name="liveLocationSharing" 
                                    checked={formData.liveLocationSharing} 
                                    onChange={handleInputChange} 
                                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button 
                                type="button" 
                                onClick={handleGetCurrentLocation}
                                className="secondary-btn flex items-center justify-center gap-2"
                                style={{ margin: 0, height: '44px', width: '100%', background: 'rgba(var(--accent-rgb), 0.1)', border: '1px solid var(--accent)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <Crosshair size={18} /> Use My Current Location
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={handleMarkOnMap}
                                className="secondary-btn flex items-center justify-center gap-2"
                                style={{ margin: 0, height: '44px', width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <MapPin size={18} /> Mark on Map
                            </button>
                        </div>
                    </div>

                    {/* Map Display */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pin on Map</label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Draggable Marker</span>
                        </div>
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={{ lat: formData.location.latitude, lng: formData.location.longitude }}
                                zoom={15}
                                onLoad={onMapLoad}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                    styles: [
                                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                        // Specific dark mode styles
                                    ]
                                }}
                            >
                                <Marker 
                                    position={{ lat: formData.location.latitude, lng: formData.location.longitude }} 
                                    draggable={true}
                                    onDragEnd={onMarkerDragEnd}
                                />
                            </GoogleMap>
                        ) : (
                            <div style={{ ...mapContainerStyle, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: 'var(--text-muted)' }}>Loading Map...</p>
                            </div>
                        )}
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                            Coordinates: {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}
                        </p>
                    </div>
                </div>
            </section>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <button onClick={handleSaveProfile} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)' }}>
                    {loading ? <span className="loader" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span> : <Save size={20} />}
                    {loading ? 'Saving Changes...' : 'Save Profile & Location'}
                </button>
            </div>

            <style>{`
                .settings-input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--border-color);
                    color: white;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .settings-input:focus {
                    border-color: var(--accent);
                    background: rgba(0,0,0,0.4);
                    box-shadow: 0 0 0 1px var(--accent);
                }
                .settings-input-with-icon {
                    padding-left: 45px !important;
                }
                .settings-select {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    background: #1c1c1e;
                    border: 1px solid var(--border-color);
                    color: white;
                    outline: none;
                }
                .settings-select:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 1px var(--accent);
                }
                .loader {
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default BasicInfoSettings;
