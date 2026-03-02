import React, { useState } from 'react';
import {
    LayoutDashboard,
    ShoppingCart,
    Truck,
    BarChart2,
    FileText,
    Settings
} from 'lucide-react';

const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders' },
    { id: 'fleet', icon: Truck, label: 'Fleet' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const [active, setActive] = useState('dashboard');

    return (
        <aside className="w-20 hidden md:flex flex-col items-center bg-dark-bg border-r border-dark-border py-8 space-y-8 h-screen sticky top-0">
            {/* Brand logo simple */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-dark-bg font-bold shadow-glow-primary">
                AI
            </div>

            <nav className="flex-1 flex flex-col space-y-6 w-full items-center mt-8">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActive(item.id)}
                        title={item.label}
                        className={`p-3 rounded-xl transition-all duration-300 relative group ${active === item.id
                                ? 'bg-primary/10 text-primary shadow-glow-primary'
                                : 'text-gray-400 hover:bg-dark-cardHover hover:text-gray-200'
                            }`}
                    >
                        <item.icon className="w-6 h-6" />

                        {/* Active Indicator Line */}
                        {active === item.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md" />
                        )}

                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-dark-card text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-card border border-dark-border">
                            {item.label}
                        </div>
                    </button>
                ))}
            </nav>
        </aside>
    );
}
