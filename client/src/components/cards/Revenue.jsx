import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 5200 },
    { name: 'Mar', revenue: 4800 },
    { name: 'Apr', revenue: 6300 },
    { name: 'May', revenue: 5800 },
    { name: 'Jun', revenue: 8400 },
    { name: 'Jul', revenue: 7600 },
    { name: 'Aug', revenue: 9800 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl text-sm z-50">
                <p className="font-medium text-gray-400 mb-1">{label}</p>
                <p className="text-white">
                    <span className="text-primary mr-1">$</span>
                    {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function Revenue() {
    return (
        <div className="card card-hover col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-200">Revenue</h2>
                    <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-3xl font-bold tracking-tight text-white">$84,520</span>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">+14.5%</span>
                    </div>
                </div>
                <select className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-primary cursor-pointer">
                    <option>2026</option>
                    <option>2025</option>
                </select>
            </div>

            <div className="flex-1 w-full h-[220px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8BC34A" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8BC34A" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2C2C3E', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8BC34A"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={2000}
                            activeDot={{ r: 6, fill: '#8BC34A', stroke: '#141420', strokeWidth: 2, className: "shadow-glow-primary outline-none" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
