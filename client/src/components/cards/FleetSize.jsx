import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#8BC34A', '#7C4DFF', '#2196F3']; // Primary, Secondary, Info

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl text-sm z-50">
                <p className="font-medium text-white mb-1">{payload[0].name}</p>
                <p className="text-gray-300">
                    Count: <span className="font-bold text-white ml-1">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function FleetSize({ data = [] }) {

    // Default data if empty
    const chartData = data.length ? data : [
        { name: 'Light Vehicles', value: 45 },
        { name: 'Vans', value: 120 },
        { name: 'Trucks', value: 85 }
    ];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="card card-hover flex flex-col justify-between">
            <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-200">Fleet Size</h2>
                <p className="text-sm text-gray-400">Current active vehicles</p>
            </div>

            <div className="flex-1 relative min-h-[200px]">

                {/* Center Total Number Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white leading-none">{total}</span>
                    <span className="text-xs text-gray-400 mt-1">Total Active</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="hover:opacity-80 transition-opacity outline-none"
                                    style={{ filter: `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]}80)` }}
                                />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend below */}
            <div className="flex justify-between items-center mt-4 px-2 pt-4 border-t border-dark-border/50">
                {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.3)]"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-xs text-gray-400">{entry.name}</span>
                        </div>
                        <span className="font-bold text-sm text-gray-200">{entry.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
