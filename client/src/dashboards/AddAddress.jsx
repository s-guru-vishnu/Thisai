import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LocationPickerModal from '../components/modals/LocationPickerModal';
import { MapPin, Phone, User, Landmark, Building, Home, Briefcase, Info, Navigation, ArrowLeft, Plus, Check, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

const AddAddress = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [toastData, setToastData] = useState(null);
    
    const showToast = (message, type = 'success') => {
        setToastData({ message, type });
    };
    
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        pincode: '',
        houseNumber: '',
        area: '',
        landmark: '',
        townCity: '',
        state: '',
        country: 'India',
        latitude: null,
        longitude: null,
        addressType: 'House',
        isDefault: false,
        deliveryInstructions: '',
        deliverySchedule: 'Both'
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUseCurrentLocation = () => {
        setLocationLoading(true);
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser', 'error');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({ ...prev, latitude, longitude }));
                
                // Show Map to confirm
                setShowMap(true);
                setLocationLoading(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                
                let errorMsg = 'Unable to access location.';
                if (error.code === 1) errorMsg = 'Location access denied. Please enable permissions.';
                else if (error.code === 2) errorMsg = 'Location unavailable. Trying IP-based location...';
                else if (error.code === 3) errorMsg = 'Location request timed out.';
                
                showToast(errorMsg, 'error');
                setLocationLoading(false);
                
                // Fallback: Open map at default location instead of doing nothing
                setShowMap(true);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const onLocationConfirm = async (coords, formattedAddress) => {
        setFormData(prev => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng
        }));

        // Use Geocoder to autofill remaining fields
        try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({ location: coords });
            
            if (response.results[0]) {
                const components = response.results[0].address_components;
                const getComp = (type) => components.find(c => c.types.includes(type))?.long_name || '';

                setFormData(prev => ({
                    ...prev,
                    houseNumber: getComp('subpremise') || getComp('premise') || prev.houseNumber,
                    area: getComp('sublocality_level_1') || getComp('sublocality') || getComp('route') || '',
                    townCity: getComp('locality') || getComp('postal_town') || '',
                    state: getComp('administrative_area_level_1') || '',
                    pincode: getComp('postal_code') || '',
                    country: getComp('country') || 'India'
                }));
            }
        } catch (err) {
            console.error('Autofill error:', err);
        }

        setShowMap(false);
        showToast('Address details autofilled!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

            await axios.post(`${apiBase}/api/address`, formData, config);
            showToast('Address added successfully!');
            setTimeout(() => navigate('/customer/addresses'), 1000);
        } catch (error) {
            console.error('Error saving address:', error);
            showToast(error.response?.data?.message || 'Failed to save address', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            {toastData && <Toast message={toastData.message} type={toastData.type} onClose={() => setToastData(null)} />}
            <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate(-1)} className="secondary-btn" style={{ padding: '8px', borderRadius: '50%' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Add a new address</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Create a new address for deliveries</p>
                    </div>
                </header>

                <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {/* Location Autofill Banner */}
                    <div style={{ 
                        background: 'rgba(var(--accent-rgb), 0.1)', 
                        padding: '1.5rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                                <Navigation size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Save time. Autofill your current location.</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>We'll use your GPS to fill the details for you.</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleUseCurrentLocation}
                            disabled={locationLoading}
                            className="primary-btn"
                            style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {locationLoading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                            Use My Current Location
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input name="fullName" required value={formData.fullName} onChange={handleInputChange} className="form-input" placeholder="Full Name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input name="phone" required value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="10-digit mobile number" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input name="pincode" required value={formData.pincode} onChange={handleInputChange} className="form-input" placeholder="6 digits [0-9] PIN code" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Flat, House no., Building, Company, Apartment</label>
                                <input name="houseNumber" required value={formData.houseNumber} onChange={handleInputChange} className="form-input" placeholder="Flat / House / Building" />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Area, Street, Sector, Village</label>
                            <input name="area" required value={formData.area} onChange={handleInputChange} className="form-input" placeholder="Area / Street / Sector" />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Landmark</label>
                            <input name="landmark" value={formData.landmark} onChange={handleInputChange} className="form-input" placeholder="E.g. near Apollo Hospital" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Town/City</label>
                                <input name="townCity" required value={formData.townCity} onChange={handleInputChange} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input name="state" required value={formData.state} onChange={handleInputChange} className="form-input" />
                            </div>
                        </div>

                        <div style={{ 
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem',
                            padding: '1.5rem', background: 'rgba(255,107,0,0.05)', borderRadius: '12px', border: '1px solid rgba(255,107,0,0.1)'
                        }}>
                            <div className="form-group">
                                <label className="form-label" style={{ color: 'var(--accent)' }}>Latitude</label>
                                <input name="latitude" type="number" step="any" required value={formData.latitude || ''} onChange={handleInputChange} className="form-input" placeholder="0.0000" />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ color: 'var(--accent)' }}>Longitude</label>
                                <input name="longitude" type="number" step="any" required value={formData.longitude || ''} onChange={handleInputChange} className="form-input" placeholder="0.0000" />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label">Address Type</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['House', 'Apartment', 'Business', 'Other'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                            background: formData.addressType === type ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                                            color: formData.addressType === type ? 'white' : 'var(--text-color)',
                                            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        {type === 'House' && <Home size={16} />}
                                        {type === 'Apartment' && <Building size={16} />}
                                        {type === 'Business' && <Briefcase size={16} />}
                                        {type === 'Other' && <Info size={16} />}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Delivery Settings</h4>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Delivery Schedule</label>
                                <select name="deliverySchedule" value={formData.deliverySchedule} onChange={handleInputChange} className="form-input" style={{ width: '100%' }}>
                                    <option value="Both">Weekdays & Weekends</option>
                                    <option value="Weekdays">Weekdays only (Mon-Fri)</option>
                                    <option value="Weekends">Weekends only (Sat-Sun)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Delivery Instructions</label>
                                <textarea name="deliveryInstructions" value={formData.deliveryInstructions} onChange={handleInputChange} className="form-input" style={{ width: '100%', minHeight: '80px', paddingTop: '10px' }} placeholder="E.g. Leave at the front desk" />
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} id="isDefault" style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }} />
                                <label htmlFor="isDefault" style={{ fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer' }}>Make this my default address</label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="primary-btn" 
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Add Address'}
                        </button>
                    </form>
                </div>
            </main>

            <LocationPickerModal 
                isOpen={showMap} 
                onClose={() => setShowMap(false)} 
                onConfirm={onLocationConfirm}
                initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
            />

            <style>{`
                .form-label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-muted); }
                .form-input { 
                    width: 100%; padding: 12px; border-radius: 8px; 
                    background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); 
                    color: white; outline: none; transition: border-color 0.2s;
                }
                .form-input:focus { border-color: var(--accent); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AddAddress;
