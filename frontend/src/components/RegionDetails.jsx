import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Activity, AlertCircle, ArrowLeft } from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

function RegionDetails({ product }) {
  const { regionName } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product || !regionName) return;
    setLoading(true);
    
    // Use URLSearchParams for robust encoding of names with spaces or special chars
    const params = new URLSearchParams({ product, region: regionName });
    
    api.get(`/api/demand?${params.toString()}`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error("Error fetching region data:", err.response?.data || err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [product, regionName]);

  const insight = useMemo(() => {
    if (!data || data.demand_score == null) return null;
    const score = data.demand_score;
    if (score > 75) return { text: "High demand — scale up production", color: 'text-red-600', bg: 'bg-gradient-to-r from-red-50 to-orange-50', border: 'border-red-200', icon: '🔥' };
    if (score >= 50) return { text: "Moderate demand — maintain current output", color: 'text-amber-600', bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-200', icon: '⚡' };
    return { text: "Low demand — reduce inventory", color: 'text-emerald-600', bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', border: 'border-emerald-200', icon: '📦' };
  }, [data]);

  const mockSparklineData = useMemo(() => {
    if (!data || data.demand_score == null) return [];
    let base = data.demand_score;
    const spark = [];
    for (let i = 6; i > 0; i--) {
      spark.push({
        month: `Month - ${i}`,
        value: Math.max(0, Math.min(100, base + (Math.random() * 20 - 10)))
      });
      base = base * 0.95;
    }
    return spark.reverse();
  }, [data]);

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <p className="text-slate-500">Please search for a product first.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-brand-200/50 transition-all font-medium">Go to Search</button>
      </div>
    );
  }

  return (
    <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-surface-200 bg-gradient-to-r from-brand-50/50 via-indigo-50/30 to-transparent">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white hover:bg-brand-50 rounded-xl text-slate-500 hover:text-brand-600 transition-all border border-surface-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{regionName}</h1>
          <p className="text-slate-500 mt-1">Comprehensive Demand Analysis for <span className="text-brand-600 font-semibold">{product}</span></p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
             <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p>Analyzing deeper signals for {regionName}...</p>
          </div>
        ) : !data ? (
          <div className="text-center p-12 text-red-500">Failed to load region data.</div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Core Metrics & Insight Row */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 grid grid-rows-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-lg">Demand Score</span>
                  </div>
                  <div className="text-5xl font-extrabold text-slate-900 mt-4">
                    {data.demand_score.toFixed(1)}<span className="text-slate-400 text-2xl">/100</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-2xl border border-violet-200/50 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <div className="p-1.5 bg-violet-100 rounded-lg">
                      <Package className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="font-semibold text-lg">Recommended Units</span>
                  </div>
                  <div className="text-5xl font-extrabold text-violet-600 mt-4">
                    {Math.round(data.recommended_units)}
                  </div>
                </div>
              </div>

              {/* Advanced Signal Breakdown */}
              <div className="md:col-span-2 bg-white/80 backdrop-blur rounded-2xl border border-surface-200 p-6 flex flex-col justify-center shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Aggregate Signals Breakdown</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">📈 Google Trends Heat (40% Weight)</span>
                      <span className="font-bold text-slate-800">{data.signals.trend.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-blue-100/60 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${data.signals.trend}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">💬 Social Media Mentions (30% Weight)</span>
                      <span className="font-bold text-slate-800">{data.signals.social.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-purple-100/60 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${data.signals.social}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">🛒 E-Commerce Velocity (30% Weight)</span>
                      <span className="font-bold text-slate-800">{data.signals.ecommerce.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-emerald-100/60 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${data.signals.ecommerce}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scale & Strategy Suggestion */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-surface-100 bg-gradient-to-r from-indigo-50/50 to-transparent flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Scale & Strategy Suggestion</h3>
                  <p className="text-sm text-slate-500 mt-1">AI-calculated entry strategy based on current market velocity</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${
                  data.scale_suggestion?.scale_type === 'Large Scale' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                  data.scale_suggestion?.scale_type === 'Medium Scale' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                  'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}>
                  {data.scale_suggestion?.scale_type || 'Analyzing Scale...'}
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-700 italic leading-relaxed">
                  "{data.scale_suggestion?.description || 'Determining tactical approach based on signal velocity...'}"
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pros */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                       <div className="p-1 bg-emerald-100 rounded-md">
                         <TrendingUp className="w-3.5 h-3.5" />
                       </div>
                       Strategic Advantages (Pros)
                    </h4>
                    <div className="space-y-2">
                       {data.scale_suggestion?.pros?.map((pro, idx) => (
                         <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl text-sm text-emerald-800 font-medium">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           {pro}
                         </div>
                       )) || <p className="text-xs text-slate-400">Loading advantages...</p>}
                    </div>
                  </div>

                  {/* Cons */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-rose-600 uppercase tracking-widest flex items-center gap-2">
                       <div className="p-1 bg-rose-100 rounded-md">
                         <AlertCircle className="w-3.5 h-3.5" />
                       </div>
                       Market Risks (Cons)
                    </h4>
                    <div className="space-y-2">
                       {data.scale_suggestion?.cons?.map((con, idx) => (
                         <div key={idx} className="flex items-center gap-3 p-3 bg-rose-50/40 border border-rose-100/50 rounded-xl text-sm text-rose-800 font-medium">
                           <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                           {con}
                         </div>
                       )) || <p className="text-xs text-slate-400">Loading risk factors...</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Sparkline Row */}
            <div className="bg-gradient-to-br from-sky-50/80 to-indigo-50/50 rounded-2xl border border-sky-200/50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-sky-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                  </div>
                  <h3 className="text-lg font-bold">6-Month Trajectory Projection</h3>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSparklineData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #bfdbfe', borderRadius: '12px', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.1)' }}
                      itemStyle={{ color: '#2563eb' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="url(#lineGradient)" 
                      strokeWidth={4} 
                      dot={{ r: 5, fill: '#ffffff', strokeWidth: 3, stroke: '#3b82f6' }}
                      activeDot={{ r: 8, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegionDetails;
