import React, { useState } from 'react';
import { Eye, ArrowRight, BrainCircuit } from 'lucide-react';

const mockOrders = [
    { id: 'ORD-8901', driver: 'Alex Morgan', pickup: 'Downtown Hub', delivery: 'Northside Clinic', eta: '10:30 AM', status: 'In Progress', predictiveRisk: 12 },
    { id: 'ORD-8902', driver: 'James Chen', pickup: 'West Port', delivery: 'Central Station', eta: '11:15 AM', status: 'Pending', predictiveRisk: 88 },
    { id: 'ORD-8903', driver: 'Sarah Jones', pickup: 'East Storage', delivery: 'Tech Park B', eta: '09:45 AM', status: 'Completed', predictiveRisk: 2 },
    { id: 'ORD-8904', driver: 'Unassigned', pickup: 'Airport Cargo', delivery: 'South District', eta: 'TBD', status: 'Pending', predictiveRisk: 45 },
    { id: 'ORD-8905', driver: 'Mike Tyson', pickup: 'Port 5', delivery: 'Retail City', eta: '02:00 PM', status: 'In Progress', predictiveRisk: 15 },
];

export default function OrdersTable({ predictiveMode = false, onRowClick }) {
    const [activeTab, setActiveTab] = useState('All');

    const filteredOrders = mockOrders.filter(order => {
        if (activeTab === 'All') return true;
        return order.status === activeTab;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="badge badge-success">Completed</span>;
            case 'In Progress': return <span className="badge badge-warning">In Progress</span>;
            case 'Pending': return <span className="badge badge-info">Pending</span>;
            default: return <span className="badge bg-gray-500/20 text-gray-400">Unknown</span>;
        }
    };

    return (
        <div className="card w-full flex flex-col p-6">

            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-200">Recent Orders</h2>

                <div className="flex bg-dark-bg p-1 rounded-lg border border-dark-border">
                    {['All', 'Pending', 'In Progress', 'Completed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                    ? 'bg-dark-card text-white shadow-card border border-dark-border/50'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-gray-400 font-medium border-b border-dark-border/50">
                        <tr>
                            <th className="pb-3 px-4 font-normal">Order ID</th>
                            <th className="pb-3 px-4 font-normal">Driver</th>
                            <th className="pb-3 px-4 font-normal">Route</th>
                            <th className="pb-3 px-4 font-normal">ETA</th>
                            <th className="pb-3 px-4 font-normal">Status</th>
                            {predictiveMode && <th className="pb-3 px-4 font-normal text-primary flex items-center gap-1"><BrainCircuit className="w-4 h-4" /> AI Risk</th>}
                            <th className="pb-3 px-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30">
                        {filteredOrders.map(order => {
                            const isHighRisk = predictiveMode && order.predictiveRisk > 70;

                            return (
                                <tr
                                    key={order.id}
                                    onClick={() => onRowClick && onRowClick(order)}
                                    className={`group transition-colors cursor-pointer ${isHighRisk
                                            ? 'hover:bg-risk/5 risk-glow rounded-xl'
                                            : 'hover:bg-dark-cardHover'
                                        }`}
                                >
                                    <td className="py-4 px-4 font-medium text-gray-200">{order.id}</td>
                                    <td className="py-4 px-4 text-gray-300">{order.driver}</td>
                                    <td className="py-4 px-4 text-gray-400">
                                        <div className="flex items-center gap-2 max-w-[200px] truncate">
                                            <span className="truncate">{order.pickup}</span>
                                            <ArrowRight className="w-3 h-3 text-gray-500 shrink-0" />
                                            <span className="truncate">{order.delivery}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 font-medium text-gray-300">{order.eta}</td>
                                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>

                                    {predictiveMode && (
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${isHighRisk ? 'text-risk' : 'text-primary'}`}>
                                                    {order.predictiveRisk}%
                                                </span>
                                                {isHighRisk && (
                                                    <div className="w-2 h-2 rounded-full bg-risk shadow-glow-risk animate-pulse" />
                                                )}
                                            </div>
                                        </td>
                                    )}

                                    <td className="py-4 px-4 text-right">
                                        <button className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-border rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* See More Footer */}
            <div className="mt-4 pt-4 border-t border-dark-border/30 flex justify-center">
                <button className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
                    See all orders →
                </button>
            </div>
        </div>
    );
}
