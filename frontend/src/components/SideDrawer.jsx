import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, TrendingUp, Package, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SideDrawer({ isOpen, onClose, regionName, data, product }) {
  const insight = useMemo(() => {
    if (!data || data.demand_score == null) return null;
    const score = data.demand_score;
    if (score > 75) return { text: "High demand — scale up production", color: 'text-red-600', bg: 'bg-gradient-to-r from-red-50 to-orange-50', icon: '🔥' };
    if (score >= 50) return { text: "Moderate demand — maintain current output", color: 'text-amber-600', bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', icon: '⚡' };
    return { text: "Low demand — reduce inventory", color: 'text-emerald-600', bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', icon: '📦' };
  }, [data]);

  const mockSparklineData = useMemo(() => {
    // Generate realistic looking mock sparkline data depending on score
    if (!data || data.demand_score == null) return [];
    let base = data.demand_score;
    const spark = [];
    for (let i = 6; i > 0; i--) {
      spark.push({
        month: `M-${i}`,
        value: Math.max(0, Math.min(100, base + (Math.random() * 20 - 10)))
      });
      base = base * 0.95; // random trend
    }
    return spark.reverse();
  }, [data]);

  return (
    <div 
      className={`fixed top-16 right-0 bottom-0 w-96 bg-white/90 backdrop-blur-xl border-l border-surface-200 shadow-2xl shadow-indigo-200/30 transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-surface-200 bg-gradient-to-r from-brand-50/50 to-transparent">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{regionName || 'Region'}</h2>
          <p className="text-sm text-slate-500">Demand Analysis for <span className="text-brand-600 font-semibold">{product}</span></p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!data ? (
           <div className="flex flex-col items-center justify-center p-8 space-y-4 text-slate-500">
             <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
             <p>Loading deep analysis...</p>
           </div>
        ) : (
          <>
            {/* Actionable Insight */}
            <div className={`p-4 rounded-xl border border-current/20 ${insight.bg} ${insight.color} flex items-start gap-3 shadow-sm`}>
              <span className="text-xl">{insight.icon}</span>
              <div>
                <h4 className="font-bold">AI Recommendation</h4>
                <p className="text-sm opacity-90">{insight.text}</p>
              </div>
            </div>

            {/* Scale Badge */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Suggested Entry</span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                data.scale_suggestion?.scale_type === 'Large Scale' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                data.scale_suggestion?.scale_type === 'Medium Scale' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}>
                {data.scale_suggestion?.scale_type || 'Checking...'}
              </span>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Demand Score</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {data.demand_score.toFixed(1)}<span className="text-slate-400 text-lg">/100</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200/50 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Package className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium">Rec. Units</span>
                </div>
                <div className="text-3xl font-extrabold text-violet-600">
                  {Math.round(data.recommended_units)}
                </div>
              </div>
            </div>

            {/* Component Signals */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Signal Breakdown</h3>
              <div className="bg-white/60 backdrop-blur rounded-xl border border-surface-200 overflow-hidden divide-y divide-surface-200/60 shadow-sm">
                <div className="flex items-center justify-between p-3 hover:bg-blue-50/30 transition-colors">
                  <span className="text-sm text-slate-500">📈 Google Trends (40%)</span>
                  <span className="text-sm font-bold text-slate-800">{data.signals.trend.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-purple-50/30 transition-colors">
                  <span className="text-sm text-slate-500">💬 Social Mentions (30%)</span>
                  <span className="text-sm font-bold text-slate-800">{data.signals.social.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-emerald-50/30 transition-colors">
                  <span className="text-sm text-slate-500">🛒 E-Commerce (30%)</span>
                  <span className="text-sm font-bold text-slate-800">{data.signals.ecommerce.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <TrendingUp className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-bold">6-Month Trend</h3>
              </div>
              <div className="h-32 bg-gradient-to-br from-sky-50/60 to-indigo-50/40 rounded-xl border border-sky-200/40 p-2 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSparklineData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #bfdbfe', borderRadius: '8px', boxShadow: '0 4px 12px rgba(59,130,246,0.08)' }}
                      itemStyle={{ color: '#2563eb' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

SideDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  regionName: PropTypes.string,
  data: PropTypes.object,
  product: PropTypes.string
};

export default SideDrawer;
