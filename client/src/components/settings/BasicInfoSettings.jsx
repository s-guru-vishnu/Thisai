import React, { useState } from 'react';
import { User, Phone, Upload, Save } from 'lucide-react';
import axios from 'axios';

const BasicInfoSettings = ({ userContext, showToast }) => {
    const [loading, setLoading] = useState(false);
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
        nearestWarehouse: userContext.nearestWarehouse || '',
        // Keep location schema for compatibility with API, but it's not editable here anymore
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

    // Update form data when props change (sync from DB)
    React.useEffect(() => {
        setFormData({
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
            nearestWarehouse: userContext.nearestWarehouse || '',
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
    }, [userContext]);

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

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            const payload = {
                name: formData.name,
                phone: formData.phone,
                avatar: formData.avatarPreview,
                companyName: formData.companyName,
                companyType: formData.companyType,
                businessAddress: formData.businessAddress,
                warehouseLocation: formData.warehouseLocation,
                country: formData.country,
                city: formData.city,
                taxId: formData.taxId,
                location: formData.location,
                liveLocationSharing: formData.liveLocationSharing,
                nearestWarehouse: formData.nearestWarehouse || null
            };

            const { data } = await axios.put(`${apiBase}/api/auth/profile`, payload, config);

            // Store user info in localStorage, handling quota errors gracefully
            const userInfoToStore = { ...userContext, ...data };
            try {
                localStorage.setItem('userInfo', JSON.stringify(userInfoToStore));
            } catch (quotaError) {
                console.warn('LocalStorage quota exceeded, storing without avatar');
                const safeUserInfo = { ...userInfoToStore };
                delete safeUserInfo.avatar;
                localStorage.setItem('userInfo', JSON.stringify(safeUserInfo));
            }

            // Dispatch event so other components (like Navbar) update immediately
            window.dispatchEvent(new Event('userInfoChanged'));
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
