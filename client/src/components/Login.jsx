import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../styles/dashboard.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img src="/Thisai.png" alt="Thisai Logo" className="logo-orb large-orb" />
                    <h2>THISAI</h2>
                    <p>Login to your portal</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', paddingRight: '45px' }}
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

                <div className="seed-section">
                    <p className="seed-text">First time setup? Need test accounts?</p>
                    <button onClick={handleSeedDatabase} className="secondary-btn" disabled={loading}>
                        Seed Default Database
                    </button>
                </div>

                <div className="demo-credentials">
                    <small>
                        <b>Testing Accounts (PWD: password123):</b><br />
                        admin@impact.com | manager@impact.com | warehouse@impact.com<br />
                        driver@impact.com | customer@impact.com | receiver@impact.com<br />
                        seller@impact.com
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;
