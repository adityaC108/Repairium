import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import BookingsChart from "../../components/charts/BookingsChart";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await API.get("/users/profile");
        const statsRes = await API.get("/users/statistics");
        const bookingsRes = await API.get("/users/bookings?limit=1000");

        setUser(profileRes.data.data.user);
        setStats(statsRes.data.data);

        // ⚠️ IMPORTANT: correct data path
        setBookings(bookingsRes.data.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!user || !stats)
    return <div className="p-6 pt-24">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-blue-50 pt-20">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-lg p-5 hidden md:flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-indigo-600">Dashboard</h2>

        <button
          onClick={() => navigate("/user/dashboard")}
          className="text-left mb-3 hover:text-indigo-600 transition"
        >
          Home
        </button>

        <button
          onClick={() => navigate("/user/bookings")}
          className="text-left mb-3 hover:text-indigo-600 transition"
        >
          My Bookings
        </button>

        <button
          onClick={() => navigate("/user/profile")}
          className="text-left mb-3 hover:text-indigo-600 transition"
        >
          Profile
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 space-y-6">

        {/* 🔥 Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user.firstName} 👋
            </h1>
            <p className="text-blue-100">{user.email}</p>
          </div>

          <button
            onClick={() => navigate("/user/bookings")}
            className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-semibold hover:scale-105 transition"
          >
            View Bookings →
          </button>
        </div>

        {/* 🔥 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {stats.bookings.map((b, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur border border-gray-200 p-5 rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition"
            >
              <h2 className="text-gray-500 capitalize">{b._id}</h2>
              <p className="text-3xl font-bold mt-2 text-indigo-600">
                {b.count}
              </p>
            </div>
          ))}

          <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow">
            <h2 className="text-gray-500">Total Reviews</h2>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {stats.reviews.totalReviews}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow">
            <h2 className="text-gray-500">Avg Rating</h2>
            <p className="text-3xl font-bold mt-2 text-yellow-500">
              {stats.reviews.averageRating?.toFixed(1)}
            </p>
          </div>
        </div>

        {/* 🔥 Chart */}
        <BookingsChart bookings={bookings} />

      </div>
    </div>
  );
};

export default Dashboard;