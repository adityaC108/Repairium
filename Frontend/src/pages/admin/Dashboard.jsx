// import React from 'react'

// const Dashboard = () => {
//   return (
//     <div>Dashboard</div>
//   )
// }

// export default Dashboard

import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-4 rounded-xl">
          <h2>Total Users</h2>
          <p className="text-2xl">{stats.users.total}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <h2>Total Bookings</h2>
          <p className="text-2xl">{stats.bookings.total}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <h2>Total Revenue</h2>
          <p className="text-2xl">₹ {stats.revenue.total}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;