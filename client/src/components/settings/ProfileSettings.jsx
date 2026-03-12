import React, { useState } from 'react';
import { User, Phone, Globe, Upload, Save, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ProfileSettings = ({ userContext }) => {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        name: userContext.name || '',
        email: userContext.email || '',
        role: userContext.role || '',
        phone: userContext.phone || '',
        timezone: userContext.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatarPreview: userContext.avatar || null
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit.");
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
        setSuccessMessage('');
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            const payload = {
                name: formData.name,
                phone: formData.phone,
                timezone: formData.timezone,
                avatar: formData.avatarPreview
            };

            const { data } = await axios.put(`${apiBase}/api/auth/profile`, payload, config);
            
            // Update local storage context
            const updatedContext = { ...userContext, ...data };
            localStorage.setItem('userInfo', JSON.stringify(updatedContext));
            
            setSuccessMessage('Profile updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
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
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0', textTransform: 'capitalize' }}>{formData.role} Account</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                    <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
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
                        <input name="phone" type="text" placeholder="Enter Phone No." value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Timezone</label>
                    <div style={{ position: 'relative' }}>
                        <Globe size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <select name="timezone" value={formData.timezone} onChange={handleInputChange} style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: '#1c1c1e', border: '1px solid var(--border-color)', color: 'white', appearance: 'none' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                {successMessage ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }} className="fade-in">
                        <CheckCircle size={20} />
                        <span>{successMessage}</span>
                    </div>
                ) : <div />}
                
                <button onClick={handleSaveProfile} disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {loading ? <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span> : <Save size={18} />}
                    {loading ? 'Saving...' : 'Update Profile'}
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
