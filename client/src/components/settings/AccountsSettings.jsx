import React, { useState } from 'react';
import { Shield, Key, AlertCircle, CheckCircle, Trash2, Mail } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountsSettings = ({ userContext }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [accountData, setAccountData] = useState({
        email: userContext.email || ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            const { data } = await axios.put(`${apiBase}/api/auth/profile`, { email: accountData.email }, config);
            
            const updatedContext = { ...userContext, email: data.email };
            localStorage.setItem('userInfo', JSON.stringify(updatedContext));
            
            setMessage({ text: 'Email updated successfully.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to update email.', type: 'error' });
        } finally {
            setLoading(false);
        }
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
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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

    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            await axios.delete(`${apiBase}/api/auth/account`, config);
            
            localStorage.removeItem('userInfo');
            setDeleteModalOpen(false);
            navigate('/login');
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to delete account.', type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
            
            {/* Read Only Account Details */}
            <section style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: '1.4rem' }}>
                    <Shield size={24} className="text-accent" /> Account Access
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>User ID</label>
                        <input value={userContext._id || 'Pending Authentication'} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Account Role</label>
                        <input value={(userContext.role || 'Unknown').toUpperCase()} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} />
                    </div>
                </div>

                <form onSubmit={handleEmailChange} style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', maxWidth: '500px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Primary Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="email" required
                                value={accountData.email} onChange={(e) => setAccountData({ email: e.target.value })} 
                                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} 
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', padding: '12px 24px', height: '44px' }}>
                        Save
                    </button>
                </form>
            </section>

            {/* Change Password */}
            <section style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
                    <Key size={18} className="text-accent" /> Update Password
                </h4>
                
                <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Current Password</label>
                        <input 
                            name="currentPassword" type="password" required
                            value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>New Password</label>
                        <input 
                            name="newPassword" type="password" required
                            value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} 
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Min 8 characters, 1 uppercase, 1 number.</p>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Confirm New Password</label>
                        <input 
                            name="confirmPassword" type="password" required
                            value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} 
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            {loading ? 'Processing...' : 'Update Password'}
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

            {/* Danger Zone */}
            <section style={{ background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.2)', padding: '2rem', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--danger)', margin: '0 0 10px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={20} /> Danger Zone
                </h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Deleting your account will remove all logistics data, integrations, and delivery history. This action cannot be undone.
                </p>
                <button 
                    onClick={() => setDeleteModalOpen(true)}
                    style={{ padding: '10px 24px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                    Delete Account
                </button>
            </section>

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="modal-content" style={{ background: 'var(--bg-panel)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '100%', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 1rem 0' }}>
                            <Trash2 size={24} />
                        </div>
                        <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.4rem' }}>Are you sure?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5', fontSize: '0.9rem' }}>
                            All logistics tracking history, driver metrics, and marketplace configurations will be wiped permanently. 
                            <strong> Type DELETE to confirm.</strong>
                        </p>
                        
                        <input 
                            type="text" 
                            placeholder="DELETE" 
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }} 
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => { setDeleteModalOpen(false); setDeleteInput(''); }}
                                style={{ flex: 1, padding: '10px', background: 'transparent', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={deleteInput !== 'DELETE' || loading}
                                style={{ flex: 1, padding: '10px', background: deleteInput === 'DELETE' ? 'var(--danger)' : 'gray', color: 'white', border: 'none', borderRadius: '8px', cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed', fontWeight: '600' }}
                            >
                                Confirm Erase
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default AccountsSettings;
