import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Layout Components
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

// Cards & UI
import OrderStats from '../components/cards/OrderStats';
import FleetSize from '../components/cards/FleetSize';
import Revenue from '../components/cards/Revenue';
import OrdersTable from '../components/OrdersTable';
import DelayRiskBadge from '../components/ui/DelayRiskBadge';
import SkeletonCard from '../components/ui/SkeletonCard';
import PredictiveToggle from '../components/PredictiveToggle';
import OrderDetailModal from '../components/OrderDetailModal';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [predictiveMode, setPredictiveMode] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeDelays, setActiveDelays] = useState(0);

    // Simulate data fetching
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Simulate predictive mode risk detection loop
    useEffect(() => {
        if (!predictiveMode || loading) {
            setActiveDelays(0);
            return;
        }

        const initialDelay = setTimeout(() => {
            setActiveDelays(3);
            toast.error('AI detected 3 high-risk delivery routes based on current traffic anomalies', {
                icon: '⚠️',
                style: {
                    borderRadius: '12px',
                    background: '#1E1E2E',
                    color: '#F44336',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                },
            });
        }, 2000);

        return () => clearTimeout(initialDelay);
    }, [predictiveMode, loading]);

    const handlePredictiveToggle = () => {
        const newState = !predictiveMode;
        setPredictiveMode(newState);
        if (newState) {
            toast.success('Predictive AI Mode Activated', {
                style: {
                    borderRadius: '12px',
                    background: '#1E1E2E',
                    color: '#fff',
                    border: '1px solid rgba(139, 195, 74, 0.3)',
                },
            });
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-dark-bg selection:bg-primary/30 font-sans">
            <Toaster position="top-right" />

            {/* Left Sidebar Layout */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <TopNav />

                {/* Scrollable Dashboard View */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">

                    <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-12">

                        {/* Header Area with Toggles */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h2>
                                <p className="text-gray-400 text-sm">Real-time status of your logistics network.</p>
                            </div>

                            <div className="flex items-center flex-wrap gap-4 sm:gap-6 bg-dark-card/50 p-2 sm:p-4 rounded-xl border border-dark-border/50">
                                <DelayRiskBadge count={activeDelays} />
                                {activeDelays > 0 && <div className="hidden sm:block w-px h-8 bg-dark-border" />}
                                <PredictiveToggle
                                    isEnabled={predictiveMode}
                                    onToggle={handlePredictiveToggle}
                                />
                            </div>
                        </div>

                        {/* Top Grid: Stats, Fleet, Revenue */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                            {/* Order Stats takes 2 cols on lg, full on sm */}
                            <div className="col-span-1 lg:col-span-2">
                                {loading ? <SkeletonCard type="stats" /> : <OrderStats />}
                            </div>

                            {/* Fleet Size */}
                            <div className="col-span-1">
                                {loading ? <SkeletonCard type="chart" /> : <FleetSize />}
                            </div>

                            {/* Revenue */}
                            <div className="col-span-1">
                                {loading ? <SkeletonCard type="chart" /> : <Revenue />}
                            </div>

                        </div>

                        {/* Bottom Grid: Orders Table */}
                        <div className="w-full">
                            {loading ? (
                                <SkeletonCard type="standard" />
                            ) : (
                                <OrdersTable
                                    predictiveMode={predictiveMode}
                                    onRowClick={(order) => setSelectedOrder(order)}
                                />
                            )}
                        </div>

                    </div>
                </main>
            </div>

            {/* Detail Modal Overlay */}
            <OrderDetailModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
                predictiveMode={predictiveMode}
            />

        </div>
    );
}
