import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Reports = () => {
  const [type, setType] = useState("revenue");
  const [data, setData] = useState([]);

    useEffect(() => {
      const fetchReports = async () => {
        try {
          const res = await adminService.getReports(type);


          // 🔥 FIX BASED ON TYPE
          const reportArray = res?.data?.[type] || res?.data || [];

          // ✅ Ensure it's always array
          setData(Array.isArray(reportArray) ? reportArray : []);
        } catch (err) {
          console.error("Error fetching reports", err);
        }
      };

      fetchReports();
    }, [type]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

      {/* Filter */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mb-6 border px-4 py-2 rounded-lg"
      >
        <option value="revenue">Revenue</option>
        <option value="bookings">Bookings</option>
        <option value="users">Users</option>
      </select>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        {data.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Reports;
