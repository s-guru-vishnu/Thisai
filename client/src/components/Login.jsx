import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            // Save user to local storage for demo
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Route based on role
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
            await axios.post('http://localhost:5000/api/auth/seed');
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
                    <div className="logo-orb large-orb pulse-glow"></div>
                    <h2>IMPACT<span>LOGISTICS</span></h2>
                    <p>Login to your portal</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. admin@impact.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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
                        driver@impact.com | customer@impact.com | receiver@impact.com
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;
