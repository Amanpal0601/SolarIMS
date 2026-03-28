"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function PredictionChart({ hourlyData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={hourlyData}>
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" axisLine={false} tickLine={false} dy={10} />
        <YAxis axisLine={false} tickLine={false} dx={-10} unit=" kWh" />
        <Tooltip 
          cursor={{ stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '5 5' }}
          formatter={(value) => [`${value.toFixed(2)} kWh`, 'Predicted']}
        />
        <Area type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
