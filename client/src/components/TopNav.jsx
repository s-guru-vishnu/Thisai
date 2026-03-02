import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function TopNav() {
    return (
        <header className="h-20 flex items-center justify-between px-8 bg-dark-bg/80 backdrop-blur-md sticky top-0 z-40 border-b border-dark-border">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative hidden md:block w-64">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders, fleet..."
                        className="w-full bg-dark-card border border-dark-border rounded-full py-2 pl-12 pr-4 text-sm text-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-500"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-dark-cardHover">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full shadow-glow-primary"></span>
                </button>

                {/* Profile */}
                <button className="flex items-center gap-3 p-1 rounded-full border border-dark-border hover:border-gray-500 transition-colors bg-dark-card pr-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-purple-400 flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">Admin</span>
                </button>
            </div>
        </header>
    );
}
