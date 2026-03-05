import React from 'react';

const DashboardCard = ({ title, value, trend, icon, trendPositive }) => {
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <div className="card-icon">{icon}</div>
            </div>
            <div className="card-body">
                <div className="card-value">{value}</div>
                <div className={`card-trend ${trendPositive ? 'positive' : 'negative'}`}>
                    {trendPositive ? '↗' : '↘'} {trend}
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
