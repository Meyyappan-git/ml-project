import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, TrendingUp, Package, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SideDrawer({ isOpen, onClose, regionName, data, product }) {
  const insight = useMemo(() => {
    if (!data || data.demand_score == null) return null;
    const score = data.demand_score;
    if (score > 75) return { text: "High demand — scale up production", color: 'text-red-400', bg: 'bg-red-400/10' };
    if (score >= 50) return { text: "Moderate demand — maintain current output", color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    return { text: "Low demand — reduce inventory", color: 'text-green-400', bg: 'bg-green-400/10' };
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
      className={`fixed top-16 right-0 bottom-0 w-96 bg-dark-900 border-l border-dark-800 shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-dark-800">
        <div>
          <h2 className="text-xl font-bold text-white">{regionName || 'Region'}</h2>
          <p className="text-sm text-slate-400">Demand Analysis for <span className="text-brand-400">{product}</span></p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!data ? (
           <div className="flex flex-col items-center justify-center p-8 space-y-4 text-slate-400">
             <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
             <p>Loading deep analysis...</p>
           </div>
        ) : (
          <>
            {/* Actionable Insight */}
            <div className={`p-4 rounded-xl border border-current ${insight.bg} ${insight.color} flex items-start gap-3`}>
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold">AI Recommendation</h4>
                <p className="text-sm opacity-90">{insight.text}</p>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">Demand Score</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {data.demand_score.toFixed(1)}<span className="text-slate-500 text-lg">/100</span>
                </div>
              </div>
              <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Rec. Units</span>
                </div>
                <div className="text-3xl font-bold text-brand-400">
                  {Math.round(data.recommended_units)}
                </div>
              </div>
            </div>

            {/* Component Signals */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Signal Breakdown</h3>
              <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden divide-y divide-dark-700">
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm text-slate-400">Google Trends (40%)</span>
                  <span className="text-sm font-semibold text-white">{data.signals.trend.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm text-slate-400">Social Mentions (30%)</span>
                  <span className="text-sm font-semibold text-white">{data.signals.social.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm text-slate-400">E-Commerce Velocity (30%)</span>
                  <span className="text-sm font-semibold text-white">{data.signals.ecommerce.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <TrendingUp className="w-4 h-4" />
                <h3 className="text-sm font-semibold">6-Month Trend</h3>
              </div>
              <div className="h-32 bg-dark-800 rounded-xl border border-dark-700 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSparklineData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }}
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
