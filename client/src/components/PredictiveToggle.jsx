import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function PredictiveToggle({ isEnabled, onToggle }) {
    return (
        <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${isEnabled ? 'text-primary drop-shadow-[0_0_8px_rgba(139,195,74,0.8)]' : 'text-gray-400'}`}>
                Predictive Mode
            </span>

            <button
                onClick={onToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-primary ${isEnabled ? 'bg-primary shadow-glow-primary' : 'bg-dark-border'}`}
            >
                <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 flex items-center justify-center ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                >
                    {isEnabled && <BrainCircuit className="w-3 h-3 text-primary animate-pulse" />}
                </div>
            </button>

            {/* Secret tooltip */}
            <div className="group relative pointer-events-auto">
                <div className="w-4 h-4 rounded-full bg-dark-bg border border-dark-border text-gray-400 flex items-center justify-center text-[10px] cursor-help hover:border-primary transition-colors">
                    ?
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-dark-card border border-primary/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-xs text-gray-300 z-50">
                    Enabling this activates the AI model. It forecasts delay probabilities based on live traffic, weather, and historical constraints, highlighting risky deliveries.
                </div>
            </div>
        </div>
    );
}
