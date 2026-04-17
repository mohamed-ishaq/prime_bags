import React from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const QuantitySelector = ({ value, onChange, min = 1, max = 99, disabled = false }) => {
    const dec = () => onChange(clamp((value || 1) - 1, min, max));
    const inc = () => onChange(clamp((value || 1) + 1, min, max));

    return (
        <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-soft">
            <button
                type="button"
                disabled={disabled || value <= min}
                onClick={dec}
                className="px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                aria-label="Decrease quantity"
            >
                −
            </button>
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    onChange(clamp(Number.isFinite(next) ? next : min, min, max));
                }}
                className="w-16 border-x border-slate-200 bg-white px-2 py-2 text-center text-sm font-semibold text-slate-900 outline-none"
                aria-label="Quantity"
            />
            <button
                type="button"
                disabled={disabled || value >= max}
                onClick={inc}
                className="px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    );
};

export default QuantitySelector;

