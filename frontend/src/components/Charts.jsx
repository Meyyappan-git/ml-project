import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BrandDemand from './BrandDemand';
import { BarChart3, Building2, LayoutGrid } from 'lucide-react';

function Charts({ data, product, selectedState, onStateChange }) {
  const [view, setView] = useState('regions');

  if (!data || data.length === 0) return null;

  // Get top 10 regions by demand score
  const topRegions = [...data].sort((a, b) => b.demand_score - a.demand_score).slice(0, 10);
  
  // Custom tooltip with colorful light theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur border border-brand-100 p-3 rounded-xl shadow-lg shadow-brand-100/30 text-xs text-slate-900 font-medium">
          <p className="font-bold mb-1 border-b border-slate-100 pb-1">{label}</p>
          <p className="text-brand-600 mt-1">
            Demand: <span className="font-bold text-slate-900">{payload[0].value.toFixed(1)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* View Switcher & Region Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-surface-100/80 backdrop-blur p-1 rounded-xl border border-surface-200/50 flex gap-1">
            <button 
              onClick={() => setView('regions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'regions' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-brand-600'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Regional Demand
            </button>
            <button 
              onClick={() => setView('brands')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'brands' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-brand-600'}`}
            >
              <Building2 className="w-4 h-4" /> Brand Insight
            </button>
          </div>

          {/* New Region Selector in Analytics View */}
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="bg-white border border-surface-200 text-slate-700 text-sm rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-brand-400/20 shadow-sm cursor-pointer min-w-[150px]"
          >
            <option value="">Pan-India View</option>
            {data.map(d => (
              <option key={d.region} value={d.region}>{d.region}</option>
            ))}
          </select>
        </div>
        
        <div className="text-right">
          <h2 className="text-lg font-bold text-slate-900">
            {view === 'regions' ? 'Regional Distribution' : 'Brand Intelligence'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Analyzing <span className="text-brand-600 font-bold">{product}</span> {selectedState ? `in ${selectedState}` : 'across India'}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {view === 'regions' ? (
          <div className="bg-white/50 backdrop-blur rounded-2xl border border-surface-200 p-6 h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-500" /> Top 10 High-Demand Regions
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRegions} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf8" vertical={false} />
                  <XAxis 
                    dataKey="region" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontWeight={600}
                    tickMargin={10}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f0f4ff'}} />
                  <Bar dataKey="demand_score" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            <BrandDemand initialProduct={product} initialState={selectedState} />
          </div>
        )}
      </div>
    </div>
  );
}

Charts.propTypes = {
  data: PropTypes.array,
  product: PropTypes.string,
  selectedState: PropTypes.string
};

export default Charts;
