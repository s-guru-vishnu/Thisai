import React, { useEffect, useState } from 'react';
import { X, MapPin, Navigation, Clock, ShieldAlert, Package, CheckCircle2 } from 'lucide-react';

export default function OrderDetailModal({ isOpen, onClose, order, predictiveMode = false }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShow(true), 10);
        } else {
            setShow(false);
        }
    }, [isOpen]);

    if (!isOpen && !show) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>

            {/* Backdrop overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Header Ribbon */}
                <div className={`h-2 w-full ${predictiveMode && order?.predictiveRisk > 70 ? 'bg-risk shadow-glow-risk' : 'bg-primary'}`} />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-dark-border transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 overflow-y-auto max-h-[85vh]">

                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Package className="w-6 h-6 text-primary" />
                                {order?.id || 'ORD-UNKNOWN'}
                            </h2>
                            <p className="text-gray-400 mt-1">Managed by {order?.driver || 'Unassigned'}</p>
                        </div>

                        <div className="text-right">
                            <span className={`badge ${order?.status === 'Completed' ? 'badge-success' :
                                    order?.status === 'In Progress' ? 'badge-warning' : 'badge-info'
                                }`}>
                                {order?.status || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* AI Predictive Risk Card */}
                    {predictiveMode && order?.predictiveRisk > 0 && (
                        <div className={`mb-8 p-4 rounded-xl border ${order.predictiveRisk > 70
                                ? 'bg-risk/10 border-risk/30 risk-glow'
                                : 'bg-primary/5 border-primary/20'
                            }`}>
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldAlert className={`w-5 h-5 ${order.predictiveRisk > 70 ? 'text-risk' : 'text-primary'}`} />
                                <h3 className="font-semibold text-white">AI Route Analysis</h3>
                                <span className={`ml-auto font-bold text-lg ${order.predictiveRisk > 70 ? 'text-risk' : 'text-primary'}`}>
                                    {order.predictiveRisk}% Risk
                                </span>
                            </div>
                            <p className="text-sm text-gray-300">
                                {order.predictiveRisk > 70
                                    ? "High probability of delay detected due to heavy traffic volume near destination and severe weather warnings along the active route segment."
                                    : "Route conditions are optimal. Delivery expected to be completed within the standard SLA window."}
                            </p>
                        </div>
                    )}

                    {/* Route Info */}
                    <div className="space-y-6 relative mb-8">
                        <div className="absolute left-3.5 top-5 bottom-5 w-px bg-dark-border" />

                        <div className="flex items-start gap-4 relative">
                            <div className="w-7 h-7 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center shrink-0 z-10">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Pickup Location</p>
                                <p className="text-white font-medium">{order?.pickup}</p>
                                <p className="text-sm text-gray-400">Warehouse Dock B4</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 relative">
                            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shrink-0 z-10 shadow-glow-primary">
                                <Navigation className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Delivery Destination</p>
                                <p className="text-white font-medium">{order?.delivery}</p>
                                <p className="text-sm text-gray-400">Customer Site</p>
                            </div>
                        </div>
                    </div>

                    {/* Timing Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col items-center justify-center text-center">
                            <Clock className="w-5 h-5 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 mb-1">Estimated Arrival</p>
                            <p className="text-lg font-bold text-white">{order?.eta || 'TBD'}</p>
                        </div>

                        <div className="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                            <p className="text-xs text-gray-500 mb-1">Action</p>
                            <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Update Status</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
