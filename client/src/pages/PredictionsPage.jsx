import React from 'react';
import Navbar from '../components/Navbar';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

const PredictionsPage = () => {
    const [delayData, setDelayData] = React.useState([]);
    const [workloadData, setWorkloadData] = React.useState([]);

    React.useEffect(() => {
        // TODO: Map to actual backend AI endpoints when ready
    }, []);
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
                    {/* Placeholder for future dynamic AI insights */}
                    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                        <BrainCircuit size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>AI Engine Standby</h3>
                        <p style={{ margin: 0 }}>Waiting for sufficient dynamic system data to generate predictions...</p>
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
