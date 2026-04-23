import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Box,
  Calendar,
  Star,
  TrendingUp,
  User,
  Zap,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import API from "../../services/api";
import BookingsChart from "../../components/charts/BookingsChart";
import RepairumLogo from "../../components/logo/RepairumLogo";

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
        setBookings(bookingsRes.data.data.data || []);
      } catch (err) {
        console.error("DASHBOARD_SYNC_ERROR:", err);
      }
    };
    fetchData();
  }, []);

  if (!user || !stats) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-[10px] tracking-[0.4em]">
      INITIALIZING_USER_DASHBOARD...
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 pt-24">

      {/* --- HUD HEADER --- */}
      <header className="px-6 lg:px-12 mb-12 border-b border-slate-50 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RepairumLogo width="24" height="24" className="opacity-80" />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">System_User_Session</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter italic leading-none uppercase">
              Main <span className="text-slate-200 font-light not-italic">Dashboard.</span>
            </h1>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
              <User size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated_User</p>
              <p className="text-lg font-black tracking-tighter text-slate-900 leading-none italic uppercase">{user.firstName} {user.lastName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- Left: STATUS MATRIX (4-cols) --- */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quick Navigation Panel */}
            <div className="p-4 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-2">
              <NavAction label="Synchronize Profile" path="/user/profile" icon={<User size={14} />} navigate={navigate} />
              <NavAction label="Manage Active Nodes" path="/user/bookings" icon={<Box size={14} />} navigate={navigate} />
              <NavAction label="Initialize Service" path="/services" icon={<Zap size={14} />} navigate={navigate} />
            </div>

            {/* Performance Node */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Satisfaction_Index</p>
                    <p className="text-3xl font-black italic tracking-tighter text-emerald-500">
                      {stats.reviews.averageRating?.toFixed(1)}<span className="text-sm">/5.0</span>
                    </p>
                  </div>
                  <Star size={32} className="text-slate-100 fill-emerald-500" />
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified_Reviews</p>
                    <p className="text-xl font-black italic tracking-tighter text-slate-900">{stats.reviews.totalReviews}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

             {/* Dynamic Status Map */}
            <div className="grid grid-cols-2 gap-4">
              {stats.bookings.map((b, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] hover:bg-white hover:border-indigo-100 transition-all duration-500">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{b._id}_Bookings</p>
                  <p className="text-3xl font-black tracking-tighter italic text-slate-900">{b.count}</p>
                </div>
              ))}
            </div>
          </div>
          {/* --- Right: TELEMETRY (8-cols) --- */}
          <div className="lg:col-span-8 space-y-8">

            {/* Quick Actions & Welcome */}
            <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                      Node_Welcome
                    </h3>

                    <div className={`px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${user.isVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                      {user.isVerified ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          <span>Unverified</span>
                        </>
                      )}
                    </div>
                  </div>
                  <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-4 uppercase">
                    Ready to initialize <br /> your next mission?
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{user.email}</p>
                </div>
                <button
                  onClick={() => navigate("/user/bookings")}
                  className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-indigo-600 hover:text-white active:scale-95 flex items-center gap-3"
                >
                  <Zap size={14} className="fill-amber-400 text-amber-400" />
                  View_Fleet_History
                </button>
              </div>
              {/* Decorative Orb */}
              <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
            </section>

            {/* Main Analytical Chart */}
            <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-indigo-600" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Activity_Metrics</h4>
                </div>
                <span className="text-[8px] font-mono text-slate-200">DATA_POINT_SYNC: ACTIVE</span>
              </div>
              <div className="w-full">
                <BookingsChart bookings={bookings} />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper UI Components ---

const NavAction = ({ label, path, icon, navigate }) => (
  <button
    onClick={() => navigate(path)}
    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group shadow-sm border border-slate-100"
  >
    <div className="flex items-center gap-3">
      <div className="text-indigo-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

export default Dashboard;