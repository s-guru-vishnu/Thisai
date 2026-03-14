import React, { useState } from 'react';
import { Shield, Key, AlertCircle, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountsSettings = ({ userContext, showToast }) => {
    const [loading, setLoading] = useState(false);
    

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const navigate = useNavigate();


    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(passwords.newPassword)) {
            showToast('Password must be at least 8 characters, with 1 uppercase letter and 1 number.', 'error');
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

            showToast('Password changed successfully.');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const config = { headers: { Authorization: `Bearer ${userContext.token}` } };
            
            await axios.delete(`${apiBase}/api/auth/account`, config);
            
            localStorage.removeItem('userInfo');
            setDeleteModalOpen(false);
            showToast('Account deleted successfully.'); // Changed from 'Verification email sent!' as it's for account deletion
            navigate('/login');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete account.', 'error');
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
                        <input value={userContext.userId || userContext._id || 'Pending Authentication'} disabled className="settings-input" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Account Role</label>
                        <input value={(userContext.role || 'Unknown').toUpperCase()} disabled className="settings-input" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                    </div>
                </div>

                {userContext.role === 'driver' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Driver License Number</label>
                            <input value={userContext.driverLicenseNumber || 'Not Specified'} disabled className="settings-input" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Vehicle Type</label>
                            <input value={userContext.vehicleType || 'Not Specified'} disabled className="settings-input" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Vehicle Plate Number</label>
                            <input value={userContext.vehicleNumber || 'Not Specified'} disabled className="settings-input" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Years of Experience</label>
                            <input value={userContext.yearsOfExperience ? `${userContext.yearsOfExperience} Years` : 'Not Specified'} disabled className="settings-input" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                        </div>
                    </div>
                )}

            </section>

            {/* Change Password */}
            <section style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
                    <Key size={18} className="text-accent" /> Update Password
                </h4>
                
                <form onSubmit={handlePasswordChange} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <Key size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                name="currentPassword" type={showCurrentPassword ? "text" : "password"} required
                                value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} 
                                className="settings-input settings-input-with-icon" 
                                style={{ paddingRight: '45px' }}
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
                            <Key size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                name="newPassword" type={showNewPassword ? "text" : "password"} required
                                value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
                                className="settings-input settings-input-with-icon" 
                                style={{ paddingRight: '45px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontSize: '0.9rem' }}>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Key size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required
                                value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} 
                                className="settings-input settings-input-with-icon" 
                                style={{ paddingRight: '45px' }}
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
                        <button type="submit" disabled={loading} style={{ padding: '12px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}>
                            {loading ? 'Processing...' : 'Update Password'}
                        </button>
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
                }
            `}</style>
        </div>
    );
};

export default AccountsSettings;
