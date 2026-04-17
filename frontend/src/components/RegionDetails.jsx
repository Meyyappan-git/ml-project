import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Activity, AlertCircle, ArrowLeft } from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function RegionDetails({ product }) {
  const { regionName } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product || !regionName) return;
    setLoading(true);
    axios.get(`/api/demand?product=${product}&region=${regionName}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [product, regionName]);

  const insight = useMemo(() => {
    if (!data || data.demand_score == null) return null;
    const score = data.demand_score;
    if (score > 75) return { text: "High demand — scale up production", color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20' };
    if (score >= 50) return { text: "Moderate demand — maintain current output", color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/20' };
    return { text: "Low demand — reduce inventory", color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/20' };
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
        <p className="text-slate-400">Please search for a product first.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-400">Go to Search</button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-700 shadow-xl shadow-black/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-dark-700 bg-dark-900/50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{regionName}</h1>
          <p className="text-slate-400 mt-1">Comprehensive Demand Analysis for <span className="text-brand-400 font-semibold">{product}</span></p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
             <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p>Analyzing deeper signals for {regionName}...</p>
          </div>
        ) : !data ? (
          <div className="text-center p-12 text-red-400">Failed to load region data.</div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Core Metrics & Insight Row */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 grid grid-rows-2 gap-6">
                <div className="bg-dark-900 p-6 rounded-2xl border border-dark-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Activity className="w-5 h-5 text-brand-400" />
                    <span className="font-semibold text-lg">Demand Score</span>
                  </div>
                  <div className="text-5xl font-bold text-white mt-4">
                    {data.demand_score.toFixed(1)}<span className="text-slate-500 text-2xl">/100</span>
                  </div>
                </div>
                <div className="bg-dark-900 p-6 rounded-2xl border border-dark-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Package className="w-5 h-5 text-brand-400" />
                    <span className="font-semibold text-lg">Recommended Units</span>
                  </div>
                  <div className="text-5xl font-bold text-brand-400 mt-4">
                    {Math.round(data.recommended_units)}
                  </div>
                </div>
              </div>

              {/* Advanced Signal Breakdown */}
              <div className="md:col-span-2 bg-dark-900 rounded-2xl border border-dark-700 p-6 flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-white mb-6">Aggregate Signals Breakdown</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Google Trends Heat (40% Weight)</span>
                      <span className="font-bold text-white">{data.signals.trend.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.signals.trend}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Social Media Mentions (30% Weight)</span>
                      <span className="font-bold text-white">{data.signals.social.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data.signals.social}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">E-Commerce Velocity (30% Weight)</span>
                      <span className="font-bold text-white">{data.signals.ecommerce.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.signals.ecommerce}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable AI Strategy (Full width) */}
            <div className={`p-6 rounded-2xl border ${insight.border} ${insight.bg} ${insight.color} flex items-start gap-4`}>
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h4 className="text-xl font-bold mb-1">AI Logistics Strategy</h4>
                <p className="text-lg opacity-90">{insight.text}</p>
              </div>
            </div>

            {/* Historical Sparkline Row */}
            <div className="bg-dark-900 rounded-2xl border border-dark-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-brand-400" />
                  <h3 className="text-lg font-semibold">6-Month Trajectory Projection</h3>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSparklineData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#3b82f6' }}
                      activeDot={{ r: 8, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 3 }}
                    />
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
