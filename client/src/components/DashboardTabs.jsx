import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Package } from 'lucide-react';

const DashboardTabs = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: '/seller', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: '/seller/deliveries', label: 'My Deliveries', icon: <Package size={18} /> }
    ];

    return (
        <div className="dashboard-tabs-container">
            <div className="dashboard-tabs">
                {tabs.map(tab => {
                    // Determine active state robustly
                    let isActive = false;
                    const path = location.pathname;
                    if (tab.id === '/seller') {
                        isActive = path === '/seller' || path === '/seller/dispatch';
                    } else if (tab.id === '/customer') {
                        isActive = path === '/customer' || path.startsWith('/customer/track') || path.startsWith('/customer/history');
                    } else if (tab.id === '/seller/deliveries') {
                        isActive = path === '/seller/deliveries';
                    }

                    return (
                        <button
                            key={tab.id}
                            className={`tab-item ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardTabs;
