import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, trend, icon: Icon, trendPositive }) => {
    return (
        <div className="dashboard-card group">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <div className="card-icon">
                    {Icon && <Icon size={20} className="text-accent" />}
                </div>
            </div>
            <div className="card-body">
                <div className="card-value">{value}</div>
                <div className={`card-trend ${trendPositive ? 'positive' : 'negative'} flex items-center gap-1`}>
                    {trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{trend}</span>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
