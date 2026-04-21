import React from 'react';
import { BarChart, TrendingUp, Package, IndianRupee, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TechnicianStats = ({ stats }) => {
  if (!stats) return null;
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniCard 
          icon={<TrendingUp className="text-blue-500" />} 
          label="Total Reviews" 
          value={stats.reviews.totalReviews} 
          sub={`Avg: ${stats.reviews.averageRating}`} 
          onClick={() => navigate("/technician/reviews")}
        />
        <MiniCard 
          icon={<Package className="text-orange-500" />} 
          label="Active Fleet" 
          value={stats.monthlyTrends[0]?.count || 0} 
          sub="Current Month" 
          onClick={() => navigate("/technician/my-bookings")}
        />
        <MiniCard 
          icon={<IndianRupee className="text-emerald-500" />} 
          label="Total Revenue" 
          value={`₹${stats.totalEarnings.total}`} 
          sub={`₹${stats.totalEarnings.pending} pending sync`} 
          onClick={() => navigate("/technician/completed-bookings")}
        />
      </div>

      {/* Booking Breakdown Table */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <BarChart size={14} className="text-indigo-600" /> Registry Status Breakdown
        </h3>
        <div className="space-y-4">
          {stats.bookings.map((item) => (
            <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${item._id === 'completed' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-700">{item._id.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-mono font-bold text-slate-400">{item.count} NODES</span>
                <span className="text-sm font-black text-slate-900 w-20 text-right italic tracking-tighter">₹{stats.totalEarnings?.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Redesigned Interactive MiniCard
const MiniCard = ({ icon, label, value, sub, onClick }) => (
  <div 
    onClick={onClick} 
    className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 cursor-pointer hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 active:scale-95 flex flex-col justify-between h-full"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="text-slate-200 group-hover:text-indigo-600 transition-colors">
        <ArrowUpRight size={14} />
      </div>
    </div>
    
    <div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      <div className="text-2xl font-black text-slate-900 tracking-tighter italic mt-1">{value}</div>
      <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase tracking-widest opacity-80">{sub}</p>
    </div>
  </div>
);

export default TechnicianStats;