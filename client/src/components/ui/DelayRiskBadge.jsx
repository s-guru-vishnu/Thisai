import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DelayRiskBadge({ count = 3 }) {
    if (count === 0) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-risk/10 border border-risk/30 rounded-full animate-pulse shadow-glow-risk group cursor-help relative">
            <AlertTriangle className="w-4 h-4 text-risk" />
            <span className="text-xs font-medium text-risk">
                {count} Critical Delays Imminent
            </span>

            {/* Hover Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-dark-card border border-risk/50 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center">
                <p className="text-xs text-gray-300">
                    AI predicts <span className="font-bold text-white">{count}</span> orders will breach SLA in the next hour due to extreme weather traffic anomalies.
                </p>
            </div>
        </div>
    );
}
