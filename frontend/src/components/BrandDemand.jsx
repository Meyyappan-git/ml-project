import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Award, Search, RefreshCw, Building2 } from 'lucide-react';
import axios from 'axios';

const COLORS = [
  '#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e',
  '#a855f7', '#14b8a6', '#fb923c'
];

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight="700">
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const TrendBadge = ({ trend }) => {
  const config = {
    rising: { icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Rising' },
    stable: { icon: Minus,      color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   label: 'Stable'  },
    falling:{ icon: TrendingDown, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200',   label: 'Falling' },
  };
  const { icon: Icon, color, bg, label } = config[trend] || config.stable;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${bg} ${color}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-brand-100 p-3 rounded-xl shadow-lg shadow-brand-100/20 text-xs space-y-1">
        <p className="text-slate-900 font-bold text-sm">{d.brand}</p>
        <p className="text-indigo-600">Demand Score: <span className="text-slate-900 font-semibold">{d.demand_score.toFixed(1)}</span></p>
        <p className="text-cyan-600">Market Share: <span className="text-slate-900 font-semibold">{d.market_share.toFixed(1)}%</span></p>
        <p className="text-amber-600">Rec. Units: <span className="text-slate-900 font-semibold">{d.recommended_units}</span></p>
      </div>
    );
  }
  return null;
};

function BrandDemand({ initialProduct = '', initialState = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialProduct);
  const [inputValue, setInputValue] = useState(initialProduct);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrandData = useCallback(async (product, state) => {
    if (!product.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await axios.get('/api/brand-demand', { 
        params: { product: product.trim(), state: state || undefined } 
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch brand demand data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialProduct) {
      setInputValue(initialProduct);
      setSearchQuery(initialProduct);
      fetchBrandData(initialProduct, initialState);
    }
  }, [initialProduct, initialState, fetchBrandData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSearchQuery(inputValue.trim());
    fetchBrandData(inputValue.trim(), initialState);
  };

  const topBrand = data?.brands?.[0];

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4
                      bg-gradient-to-r from-indigo-50 via-violet-50/60 to-sky-50/40
                      border border-indigo-200/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-200/50">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Brand Demand {data?.state ? `in ${data.state}` : 'Analysis'}</h2>
            <p className="text-xs text-slate-500">Discover which company dominates the market {data?.state ? `in ${data.state}` : 'for any product'}</p>
          </div>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              id="brand-search-input"
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="e.g. phone, laptop, shoes..."
              className="w-full bg-white/80 backdrop-blur border border-indigo-200/60 text-slate-800 text-sm
                         rounded-xl pl-9 pr-4 py-2.5 outline-none shadow-sm
                         focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
            />
          </div>
          <button
            id="brand-search-btn"
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50
                       text-white text-sm font-bold rounded-xl transition-all
                       flex items-center gap-2 shrink-0 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50"
          >
            {loading
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            Analyze
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50/80 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="shimmer rounded-2xl border border-surface-200 h-96" />
          <div className="shimmer rounded-2xl border border-surface-200 h-96" />
          <div className="md:col-span-2 shimmer rounded-2xl border border-surface-200 h-64" />
        </div>
      )}

      {/* Results */}
      {!loading && data && (
        <>
          {/* Top-brand hero card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-sky-50
                          border border-indigo-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]
                            from-indigo-100/40 via-transparent to-transparent pointer-events-none" />
            <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300/60 rounded-2xl shadow-sm">
              <Award className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">🏆 Highest Demand Brand</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{data.top_brand}</h3>
              <p className="text-slate-500 text-sm mt-1">
                for <span className="text-indigo-600 font-semibold">"{data.product}"</span> {data.state ? `in ${data.state}` : ''} — leads with{' '}
                <span className="text-emerald-600 font-bold">{topBrand?.market_share.toFixed(1)}%</span> market share
              </p>
            </div>
            <div className="sm:ml-auto flex gap-6 text-center">
              <div className="bg-white/60 backdrop-blur rounded-xl px-4 py-2 border border-white/80">
                <p className="text-2xl font-extrabold text-slate-900">{topBrand?.demand_score.toFixed(1)}</p>
                <p className="text-xs text-slate-500 font-medium">Demand Score</p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-xl px-4 py-2 border border-white/80">
                <p className="text-2xl font-extrabold text-cyan-600">{topBrand?.recommended_units}</p>
                <p className="text-xs text-slate-500 font-medium">Rec. Units</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/60 backdrop-blur rounded-xl px-4 py-2 border border-white/80">
                <TrendBadge trend={topBrand?.trend} />
                <p className="text-xs text-slate-500 mt-1 font-medium">Trend</p>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Pie chart */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">
                🥧 Market Share Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.brands}
                    dataKey="market_share"
                    nameKey="brand"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={55}
                    labelLine={false}
                    label={renderCustomLabel}
                    paddingAngle={3}
                  >
                    {data.brands.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">
                📊 Demand Score by Brand
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.brands} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8edf8" vertical={false} />
                  <XAxis
                    dataKey="brand"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={v => v.length > 9 ? v.slice(0, 9) + '…' : v}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0f4ff' }} />
                  <Bar dataKey="demand_score" radius={[6, 6, 0, 0]}>
                    {data.brands.map((_, index) => (
                      <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-200/80 bg-gradient-to-r from-surface-50/50 to-transparent">
              <h3 className="text-sm font-bold text-slate-700">📋 Brand-wise Detailed Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Sorted by demand score (highest first)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-50/60">
                    {['Rank', 'Brand / Company', 'Demand Score', 'Market Share', 'Rec. Units', 'Trend'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-slate-500 px-5 py-3 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.brands.map((brand, i) => (
                    <tr
                      key={brand.brand}
                      className={`border-t border-surface-200/60 transition-all hover:bg-brand-50/30
                                  ${i === 0 ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                                        ${i === 0 ? 'bg-gradient-to-br from-amber-200 to-orange-200 text-amber-700' :
                                          i === 1 ? 'bg-slate-100 text-slate-500' :
                                          i === 2 ? 'bg-amber-50 text-amber-600' :
                                          'bg-surface-100 text-slate-400'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        {brand.brand}
                        {i === 0 && <span className="ml-1 text-amber-500 text-xs">👑</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] bg-surface-200/60 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${brand.demand_score}%`,
                                background: COLORS[i % COLORS.length]
                              }}
                            />
                          </div>
                          <span className="text-slate-800 font-mono font-bold">{brand.demand_score.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-cyan-600 font-bold">{brand.market_share.toFixed(1)}%</td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">{brand.recommended_units}</td>
                      <td className="px-5 py-3.5"><TrendBadge trend={brand.trend} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !data && !error && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/50 rounded-2xl shadow-sm">
            <Building2 className="w-10 h-10 text-indigo-400 mx-auto" />
          </div>
          <p className="text-slate-500 text-sm max-w-xs">
            Enter a product name above to see which companies are in high demand and their market share breakdown.
          </p>
        </div>
      )}
    </div>
  );
}

export default BrandDemand;
