import React from 'react';
import { BarChart, TrendingUp, Package, IndianRupee } from 'lucide-react';

const TechnicianStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniCard 
          icon={<TrendingUp className="text-blue-500" />} 
          label="Total Reviews" 
          value={stats.reviews.totalReviews} 
          sub={`Avg: ${stats.reviews.averageRating}`} 
        />
        <MiniCard 
          icon={<Package className="text-orange-500" />} 
          label="Total Managed" 
          value={stats.monthlyTrends[0]?.count || 0} 
          sub="This Month" 
        />
        <MiniCard 
          icon={<IndianRupee className="text-emerald-500" />} 
          label="Total Revenue" 
          value={`₹${stats.totalEarnings.total}`} 
          sub={`₹${stats.totalEarnings.pending} pending`} 
        />
      </div>

      {/* Booking Breakdown Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart size={16} /> Booking Status Breakdown
        </h3>
        <div className="space-y-4">
          {stats.bookings.map((item) => (
            <div key={item._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item._id === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <span className="text-sm font-bold capitalize text-slate-700">{item._id}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-500">{item.count} Jobs</span>
                <span className="text-sm font-bold text-slate-900 w-16 text-right">₹{item.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MiniCard = ({ icon, label, value, sub }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xl font-black text-slate-800">{value}</div>
    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{sub}</p>
  </div>
);

export default TechnicianStats;