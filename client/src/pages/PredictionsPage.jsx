import React from 'react';
import Navbar from '../components/Navbar';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

const delayData = [
    { name: '08:00', value: 12 },
    { name: '10:00', value: 34 },
    { name: '12:00', value: 56 },
    { name: '14:00', value: 45 },
    { name: '16:00', value: 89 },
    { name: '18:00', value: 67 },
    { name: '20:00', value: 23 },
];

const workloadData = [
    { name: 'Hub A', load: 85 },
    { name: 'Hub B', load: 42 },
    { name: 'Hub C', load: 91 },
    { name: 'Hub D', load: 65 },
];

const PredictionsPage = () => {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <h1>AI <span>Predictions</span></h1>
                        <p className="subtitle">Neural network insights and delay forecasting engine.</p>
                    </div>
                </header>

                <div className="predictions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="dashboard-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Zap size={18} className="text-accent" /> Delay Probability (Next 24h)
                        </h3>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={delayData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--accent)' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="var(--accent)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={18} className="text-info" /> Hub Workload Distribution
                        </h3>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workloadData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                                        {workloadData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.load > 80 ? 'var(--danger)' : 'var(--info)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="ai-insights-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div className="dashboard-card" style={{ padding: '20px', borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <AlertTriangle size={20} className="text-warning" />
                            <h4 style={{ margin: 0 }}>Delay Warning</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                            Hub C reaching 91% capacity. Transfer 15% inbound load to Hub B to avoid bottlenecks.
                        </p>
                    </div>
                    <div className="dashboard-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <Lightbulb size={20} className="text-accent" />
                            <h4 style={{ margin: 0 }}>Route Optimization</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                            AI suggests shifting Route 4 pickups to 10:00 AM to avoid the predicted 4:00 PM peak traffic.
                        </p>
                    </div>
                    <div className="dashboard-card" style={{ padding: '20px', borderLeft: '4px solid var(--success)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <BrainCircuit size={20} className="text-success" />
                            <h4 style={{ margin: 0 }}>Efficiency Spike</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                            Warehouse A performance improved by 12% following the new scanning protocol implementation.
                        </p>
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 900px) {
                    .predictions-grid { grid-template-columns: 1fr !important; }
                    .ai-insights-container { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default PredictionsPage;
