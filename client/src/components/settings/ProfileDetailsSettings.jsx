import React, { useState } from 'react';
import { Save, CheckCircle, Truck, Map, Clock, Package } from 'lucide-react';
import axios from 'axios';

const ProfileDetailsSettings = ({ userContext }) => {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        primaryRegion: userContext.logisticsPreferences?.primaryRegion || '',
        transportType: userContext.logisticsPreferences?.transportType || '',
        fleetSize: userContext.logisticsPreferences?.fleetSize || '',
        operatingHours: userContext.logisticsPreferences?.operatingHours || '',
        averageDelivery: userContext.operationalDetails?.averageDelivery || '',
        warehouseCapacity: userContext.operationalDetails?.warehouseCapacity || '',
        deliveryZones: userContext.operationalDetails?.deliveryZones || '',
        serviceType: userContext.operationalDetails?.serviceType || ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setSuccessMessage('');
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            const payload = {
                logisticsPreferences: {
                    primaryRegion: formData.primaryRegion,
                    transportType: formData.transportType,
                    fleetSize: formData.fleetSize,
                    operatingHours: formData.operatingHours
                },
                operationalDetails: {
                    averageDelivery: formData.averageDelivery,
                    warehouseCapacity: formData.warehouseCapacity,
                    deliveryZones: formData.deliveryZones,
                    serviceType: formData.serviceType
                }
            };

            const { data } = await axios.put(`${apiBase}/api/auth/profile`, payload, config);
            
            const updatedContext = { ...userContext, ...data };
            localStorage.setItem('userInfo', JSON.stringify(updatedContext));
            
            setSuccessMessage('Logistics details updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating details:', error);
            alert('Failed to update details: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Operational Details</h3>
                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Store your logistics-specific operational details.</p>
            </div>

            {/* Logistics Preferences */}
            <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Logistics Preferences</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Primary Delivery Region</label>
                        <div style={{ position: 'relative' }}>
                            <Map size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="primaryRegion" type="text" placeholder="e.g. North America, Southern India" value={formData.primaryRegion} onChange={handleInputChange} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Preferred Transport Type</label>
                        <select name="transportType" value={formData.transportType} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1c1c1e', border: '1px solid var(--border-color)', color: 'white' }}>
                            <option value="">Select Transport Type</option>
                            <option value="Truck">Truck</option>
                            <option value="Van">Van</option>
                            <option value="Bike">Bike</option>
                            <option value="Mixed Fleet">Mixed Fleet</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Fleet Size</label>
                        <div style={{ position: 'relative' }}>
                            <Truck size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="fleetSize" type="text" placeholder="e.g. 10 - 50 Vehicles" value={formData.fleetSize} onChange={handleInputChange} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Operating Hours</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="operatingHours" type="text" placeholder="e.g. 24/7 or 9 AM - 6 PM" value={formData.operatingHours} onChange={handleInputChange} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Operational Activity</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Average Daily Deliveries</label>
                        <div style={{ position: 'relative' }}>
                            <Package size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input name="averageDelivery" type="text" placeholder="e.g. 5,000+" value={formData.averageDelivery} onChange={handleInputChange} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Warehouse Capacity</label>
                        <input name="warehouseCapacity" type="text" placeholder="e.g. 100,000 sq ft" value={formData.warehouseCapacity} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Delivery Zones</label>
                        <input name="deliveryZones" type="text" placeholder="e.g. North, East, Central" value={formData.deliveryZones} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Service Type</label>
                        <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1c1c1e', border: '1px solid var(--border-color)', color: 'white' }}>
                            <option value="">Select Service Type</option>
                            <option value="Last Mile Delivery">Last Mile Delivery</option>
                            <option value="Warehouse Fulfillment">Warehouse Fulfillment</option>
                            <option value="Cross Border Shipping">Cross Border Shipping</option>
                            <option value="Bulk Logistics">Bulk Logistics</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                {successMessage ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }} className="fade-in">
                        <CheckCircle size={20} />
                        <span>{successMessage}</span>
                    </div>
                ) : <div />}
                
                <button onClick={handleSaveProfile} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {loading ? <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span> : <Save size={18} />}
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default ProfileDetailsSettings;
