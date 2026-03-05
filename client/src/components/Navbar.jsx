import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <div className="logo-orb"></div>
                <span className="brand-name">IMPACT<span className="brand-accent">LOGISTICS</span></span>
            </div>

            <ul className="nav-links">
                <li className="active"><a href="#dashboard">Dashboard</a></li>
                <li><a href="#map">Live Map</a></li>
                <li><a href="#parcels">Parcels</a></li>
                <li><a href="#drivers">Drivers</a></li>
                <li><a href="#predictions">AI Predictions</a></li>
            </ul>

            <div className="nav-profile">
                <div className="notifications">
                    <span className="indicator"></span>
                    🔔
                </div>
                <div className="avatar">
                    <img src="https://ui-avatars.com/api/?name=User&background=FF6600&color=fff&rounded=true" alt="User avatar" />
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
