import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapPin, Plus, Trash2, Home, Building, Briefcase, Info, CheckCircle2, Phone, Map as MapIcon, PlusCircle, ArrowLeft, Navigation, Loader2, Save, Crosshair, ChevronRight } from 'lucide-react';
import LocationPickerModal from '../modals/LocationPickerModal';

const AddressesSettings = ({ userContext, showToast }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const [formData, setFormData] = useState({
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
    });

    const fetchAddresses = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            const { data } = await axios.get(`${apiBase}/api/address`, config);
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            showToast('Failed to load addresses', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEdit = (addr) => {
        setFormData({
            pincode: addr.pincode || '',
            houseNumber: addr.houseNumber || '',
            area: addr.area || '',
            landmark: addr.landmark || '',
            townCity: addr.townCity || '',
            state: addr.state || '',
            country: addr.country || 'India',
            latitude: addr.latitude || null,
            longitude: addr.longitude || null,
            addressType: addr.addressType || 'House',
            isDefault: addr.isDefault || false,
        });
        setEditingId(addr._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            await axios.delete(`${apiBase}/api/address/${id}`, config);
            showToast('Address deleted');
            fetchAddresses();
        } catch (error) {
            showToast('Failed to delete address', 'error');
        }
    };

    const handleUseCurrentLocation = () => {
        setLocationLoading(true);
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser', 'error');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({ ...prev, latitude, longitude }));
                setShowMap(true);
                setLocationLoading(false);
                showToast('Position detected! Confirm on map.');
            },
            (error) => {
                console.error('Geolocation error:', error);
                showToast('Unable to access location. Please enable location services.', 'error');
                setLocationLoading(false);
                // Fallback: just show map at default location
                setShowMap(true);
            }
        );
    };

    const onLocationConfirm = async (coords, formattedAddress) => {
        setShowMap(false);
        setFormData(prev => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng
        }));

        // Perform structured geocode to fill fields
        try {
            if (window.google && window.google.maps && window.google.maps.Geocoder) {
                const geocoder = new window.google.maps.Geocoder();
                const response = await geocoder.geocode({ location: { lat: coords.lat, lng: coords.lng } });
                
                if (response.results && response.results[0]) {
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
                    setShowForm(true); // Show form after geocoding is done
                    showToast('Location confirmed! Please fill remaining details.');
                }
            }
        } catch (err) {
            console.error('Geocoding error on confirm:', err);
            setShowForm(true); // Show form anyway so they can fill manually
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            // Use profile name and phone as fallback/default for the address
            const payload = {
                ...formData,
                fullName: userContext.name,
                phone: userContext.phone
            };

            if (editingId) {
                await axios.put(`${apiBase}/api/address/${editingId}`, payload, config);
                showToast('Address updated successfully');
            } else {
                await axios.post(`${apiBase}/api/address`, payload, config);
                showToast('Address added successfully');
            }
            
            setShowForm(false);
            setEditingId(null);
            fetchAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            showToast(error.response?.data?.message || 'Failed to save address', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'House': return <Home size={18} />;
            case 'Apartment': return <Building size={18} />;
            case 'Business': return <Briefcase size={18} />;
            default: return <Info size={18} />;
        }
    };

    if (showForm) {
        return (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>{editingId ? 'Update your delivery location details' : 'Create a new address for deliveries'}</p>
                    </div>
                </div>

                <div style={{ 
                    background: 'rgba(var(--accent-rgb), 0.05)', 
                    padding: '1.5rem', 
                    borderRadius: '16px',
                    border: '1px solid rgba(var(--accent-rgb), 0.15)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'white' }}>
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'white' }}>Save time. Autofill your current location.</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>We'll use your GPS to fill the details for you.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleUseCurrentLocation}
                        disabled={locationLoading}
                        className="primary-btn"
                        style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', height: 'auto' }}
                    >
                        {locationLoading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                        Use My Current Location
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Pincode</label>
                            <input name="pincode" required value={formData.pincode} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="6 digits PIN" />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Flat, House no., Building, Apartment</label>
                            <input name="houseNumber" required value={formData.houseNumber} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Flat / House / Building" />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Area, Street, Sector, Village</label>
                        <input name="area" required value={formData.area} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Area / Street / Sector" />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Landmark (Optional)</label>
                        <input name="landmark" value={formData.landmark} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="E.g. near City Hospital" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Town/City</label>
                            <input name="townCity" required value={formData.townCity} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>State</label>
                            <input name="state" required value={formData.state} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ color: 'var(--text-muted)', marginBottom: '12px', display: 'block', fontSize: '0.9rem' }}>Address Type</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['House', 'Apartment', 'Business', 'Other'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)',
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
                        <input 
                            type="checkbox" 
                            name="isDefault" 
                            checked={formData.isDefault} 
                            onChange={handleInputChange} 
                            id="isDefault" 
                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }} 
                        />
                        <label htmlFor="isDefault" style={{ fontSize: '0.95rem', color: 'var(--text-main)', cursor: 'pointer' }}>Make this my default address</label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                        <button type="button" onClick={() => setShowForm(false)} className="secondary-btn" style={{ padding: '14px' }}>Cancel</button>
                        <button 
                            type="submit" 
                            disabled={formLoading}
                            className="primary-btn" 
                            style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {formLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {editingId ? 'Update Address' : 'Add Address'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Modal now outside conditional form block to be accessible from list view */}
            <LocationPickerModal 
                isOpen={showMap} 
                onClose={() => setShowMap(false)} 
                onConfirm={onLocationConfirm}
                initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Saved Addresses</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Manage your delivery locations and preferences</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
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
                        });
                        handleUseCurrentLocation(); // Immediately open map
                    }}
                    disabled={locationLoading}
                    className="primary-btn" 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', height: 'auto' }}
                >
                    {locationLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    Add New
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {loading ? (
                    [1, 2].map(i => <div key={i} className="skeleton-loader" style={{ height: '180px', borderRadius: '16px' }}></div>)
                ) : addresses.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                        <MapPin size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No addresses saved yet.</p>
                        <button 
                            onClick={handleUseCurrentLocation}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginTop: '10px', fontWeight: '600' }}
                        >
                            Add your first address
                        </button>
                    </div>
                ) : (
                    addresses.map(addr => (
                        <div key={addr._id} className="dashboard-card" style={{ 
                            padding: '1.25rem', 
                            position: 'relative', 
                            border: addr.isDefault ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }} onClick={() => handleEdit(addr)} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            {addr.isDefault && (
                                <div style={{ 
                                    position: 'absolute', top: '12px', right: '12px', 
                                    background: 'var(--accent)', color: 'white', 
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', 
                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold'
                                }}>
                                    <CheckCircle2 size={10} /> Default
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--accent)' }}>
                                {getIcon(addr.addressType)}
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{addr.addressType}</span>
                            </div>

                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{addr.fullName}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: '1.4' }}>
                                {addr.houseNumber}, {addr.area}<br />
                                {addr.townCity}, {addr.state} {addr.pincode}
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Phone size={12} /> {addr.phone}
                            </p>

                            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(addr._id); }} 
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }} 
                                    onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} 
                                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                                {addr.latitude && (
                                    <div title="Has GPS Coordinates" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}>
                                        <MapIcon size={12} /> GPS
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AddressesSettings;
