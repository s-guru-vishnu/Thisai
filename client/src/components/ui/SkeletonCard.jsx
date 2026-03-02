import React from 'react';

export default function SkeletonCard({ type = "standard" }) {
    if (type === "stats") {
        return (
            <div className="card h-[160px] animate-pulse">
                <div className="w-24 h-4 bg-dark-border rounded mb-6"></div>
                <div className="flex gap-6 mt-4">
                    <div className="w-24 h-24 rounded-full bg-dark-border shrink-0"></div>
                    <div className="flex-1 space-y-4 py-2">
                        <div className="w-full h-4 bg-dark-border rounded"></div>
                        <div className="w-3/4 h-4 bg-dark-border rounded"></div>
                        <div className="w-5/6 h-4 bg-dark-border rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "chart") {
        return (
            <div className="card h-[300px] animate-pulse flex flex-col">
                <div className="w-32 h-6 bg-dark-border rounded mb-4"></div>
                <div className="flex-1 w-full bg-dark-border rounded-lg"></div>
            </div>
        );
    }

    // Default standard card skeleton
    return (
        <div className="card h-[200px] animate-pulse">
            <div className="w-1/3 h-5 bg-dark-border rounded mb-4"></div>
            <div className="space-y-3">
                <div className="w-full h-8 bg-dark-border rounded"></div>
                <div className="w-5/6 h-8 bg-dark-border rounded"></div>
                <div className="w-4/6 h-8 bg-dark-border rounded"></div>
            </div>
        </div>
    );
}
