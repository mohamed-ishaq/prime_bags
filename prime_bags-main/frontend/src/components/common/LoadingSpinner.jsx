import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-accent" />
                <p className="text-sm font-medium text-slate-700">Loading…</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
