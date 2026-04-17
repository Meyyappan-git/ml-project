import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

function Charts({ data }) {
  if (!data || data.length === 0) return null;

  // Get top 10 regions by demand score
  const topRegions = [...data].sort((a, b) => b.demand_score - a.demand_score).slice(0, 10);
  
  // Custom tooltip to match dark theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-700 p-2 rounded shadow-lg text-xs">
          <p className="text-slate-200 font-semibold mb-1">{label}</p>
          <p className="text-brand-400">
            Demand: <span className="font-bold text-white">{payload[0].value.toFixed(1)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Top 10 Regions by Demand Score</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topRegions} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="region" 
              stroke="#64748b" 
              fontSize={10} 
              tickMargin={5}
              // tickFormatter={(val) => val.substring(0, 3)} 
            />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
            <Bar dataKey="demand_score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

Charts.propTypes = {
  data: PropTypes.array
};

export default Charts;
