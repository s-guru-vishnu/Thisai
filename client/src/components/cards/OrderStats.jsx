import React from 'react';
import { Truck } from 'lucide-react';

export default function OrderStats({ stats = { completed: 850, inProgress: 124, pending: 45 } }) {
    const total = stats.completed + stats.inProgress + stats.pending;
    const completedPct = (stats.completed / total) * 100;
    const inProgressPct = (stats.inProgress / total) * 100;
    const pendingPct = (stats.pending / total) * 100;

    return (
        <div className="card card-hover flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-200">Order Stats</h2>
                    <p className="text-sm text-gray-400 mt-1">This Month</p>
                </div>
                <select className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-primary cursor-pointer w-[120px]">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Year</option>
                </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
                {/* Truck SVG / Illustration */}
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-glow-primary group-hover:bg-primary/20 transition-all duration-300">
                    <Truck className="w-12 h-12 text-primary drop-shadow-[0_0_8px_rgba(139,195,74,0.8)]" />
                </div>

                {/* Stats & Progress Bars */}
                <div className="flex-1 w-full space-y-4">

                    {/* Completed */}
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(139,195,74,0.8)]"></span>
                                Completed
                            </span>
                            <span className="font-bold text-white">{stats.completed}</span>
                        </div>
                        <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(139,195,74,0.8)] transition-all duration-1000 ease-out"
                                style={{ width: `${Math.max(completedPct, 5)}%` }}
                            />
                        </div>
                    </div>

                    {/* In Progress */}
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_5px_rgba(124,77,255,0.8)]"></span>
                                In Progress
                            </span>
                            <span className="font-bold text-white">{stats.inProgress}</span>
                        </div>
                        <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-secondary h-full rounded-full shadow-[0_0_8px_rgba(124,77,255,0.8)] transition-all duration-1000 ease-out delay-100"
                                style={{ width: `${Math.max(inProgressPct, 5)}%` }}
                            />
                        </div>
                    </div>

                    {/* Pending */}
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-info shadow-[0_0_5px_rgba(33,150,243,0.8)]"></span>
                                Pending
                            </span>
                            <span className="font-bold text-white">{stats.pending}</span>
                        </div>
                        <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-info h-full rounded-full shadow-[0_0_8px_rgba(33,150,243,0.8)] transition-all duration-1000 ease-out delay-200"
                                style={{ width: `${Math.max(pendingPct, 5)}%` }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
