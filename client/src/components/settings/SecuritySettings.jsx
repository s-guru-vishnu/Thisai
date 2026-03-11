import React, { useState } from 'react';
import { Shield, Key, Smartphone, Laptop, LogOut, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const SecuritySettings = ({ userContext }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ text: 'New passwords do not match.', type: 'error' });
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(passwords.newPassword)) {
            setMessage({ text: 'Password must be at least 8 characters, with 1 uppercase letter and 1 number.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            await axios.post(`${apiBase}/api/auth/change-password`, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }, config);

            setMessage({ text: 'Password changed successfully.', type: 'success' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to update password.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', animation: 'fadeIn 0.3s ease' }}>
            
            {/* Change Password Section */}
            <section style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                    <Key size={20} className="text-accent" /> Change Password
                </h3>
                
                <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                name="currentPassword" type={showCurrentPassword ? "text" : "password"} required
                                value={passwords.currentPassword} onChange={handleInputChange} 
                                style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                name="newPassword" type={showNewPassword ? "text" : "password"} required
                                value={passwords.newPassword} onChange={handleInputChange} 
                                style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Min 8 characters, 1 uppercase, 1 number.</p>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required
                                value={passwords.confirmPassword} onChange={handleInputChange} 
                                style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        {message.text && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem' }} className="fade-in">
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span>{message.text}</span>
                            </div>
                        )}
                    </div>
                </form>
            </section>

            {/* Two Factor Authentication Section */}
            <section style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                            <Shield size={20} className="text-accent" /> Two-Factor Authentication
                        </h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '500px', lineHeight: '1.5' }}>
                            Add an extra layer of security to your account. When enabled, you'll need to enter a code from your authenticator app alongside your password.
                        </p>
                    </div>
                    <button className="secondary-btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        ENABLE
                    </button>
                </div>
            </section>

            {/* Active Sessions Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Active Sessions</h3>
                    <button className="secondary-btn" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '6px 16px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <LogOut size={16} /> Logout All Other Sessions
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Current Session */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--accent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                <Laptop size={20} className="text-accent" />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>Windows 11 • Chrome Browser</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chennai, India • 192.168.1.5</p>
                            </div>
                        </div>
                        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
                            Active Now
                        </span>
                    </div>

                    {/* Mock Alternative Session */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', background: 'transparent', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%' }}>
                                <Smartphone size={20} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-muted)' }}>iPhone 13 Pro • Safari App</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bangalore, India • 117.100.22.4</p>
                            </div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Last active 2 days ago
                        </span>
                    </div>
                </div>
            </section>
            
        </div>
    );
};

export default SecuritySettings;
