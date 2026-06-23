import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import '../styles/dashboard.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            const { data } = await axios.post(`${apiBase}/api/auth/login`, {
                email,
                password,
            });

            // Save user to local storage for demo
            localStorage.setItem('userInfo', JSON.stringify(data));

            switch (data.role) {
                case 'admin':
                    navigate('/dashboard');
                    break;
                case 'manager':
                    navigate('/manager');
                    break;
                case 'warehouse':
                    navigate('/warehouse');
                    break;
                case 'driver':
                case 'cargo_driver':
                case 'delivery_driver':
                    navigate('/driver');
                    break;
                case 'customer':
                    navigate('/customer');
                    break;
                case 'parcel_receiver':
                    navigate('/receiver');
                    break;
                case 'seller':
                    navigate('/seller');
                    break;
                default:
                    navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedDatabase = async () => {
        try {
            setLoading(true);
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
            await axios.post(`${apiBase}/api/auth/seed`);
            alert('Database seeded successfully in MongoDB Compass! Check "logist" DB.');
            setError('');
        } catch (err) {
            setError('Seed failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="login-container">

            <div className="login-box">
                <div className="login-header">
                    <img 
                        src="/Thisai.png" 
                        alt="THISAI Logo" 
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            marginBottom: '1rem', 
                            filter: 'drop-shadow(0 0 15px var(--accent-glow))' 
                        }} 
                    />
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '0.5rem' }}>THISAI</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Login to your portal</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="Enter Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', paddingLeft: '40px', paddingRight: '45px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '5px'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="primary-btn submit-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="seed-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <p className="seed-text" style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>Don't have an account? <span onClick={() => navigate('/register')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '900', textDecoration: 'underline' }}>Register</span></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
