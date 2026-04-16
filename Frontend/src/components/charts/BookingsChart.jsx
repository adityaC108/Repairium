import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const BookingsChart = ({ bookings = [] }) => {
  const [filter, setFilter] = useState("all");

  // Filter bookings
  const filtered = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  // Convert to daily format
  const dailyMap = {};

  filtered.forEach((b) => {
    const date = new Date(b.createdAt);
    const key = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    if (!dailyMap[key]) dailyMap[key] = 0;
    dailyMap[key]++;
  });

  const chartData = Object.keys(dailyMap)
    .map((key) => ({
      date: key,
      bookings: dailyMap[key],
    }))
    .sort(
      (a, b) =>
        new Date(a.date.split("/").reverse().join("-")) -
        new Date(b.date.split("/").reverse().join("-"))
    );

  // 🔥 Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">{label}</p>
          <p className="font-semibold text-indigo-400">
            {payload[0].value} bookings
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Bookings Trend
        </h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 px-3 py-1 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            {/* Axes */}
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#6b7280" }} />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Gradient */}
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            {/* Line */}
            <Line
              type="monotone"
              dataKey="bookings"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              fill="url(#lineGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingsChart;