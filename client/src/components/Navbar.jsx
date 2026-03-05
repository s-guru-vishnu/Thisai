import React from 'react';

const Navbar = () => {
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
                    <img src="https://ui-avatars.com/api/?name=Admin&background=FF6600&color=fff&rounded=true" alt="Admin user" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
