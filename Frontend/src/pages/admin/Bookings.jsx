import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, RefreshCw, Activity, Calendar, 
  User, HardHat, IndianRupee, ChevronRight,
  Filter, Box
} from "lucide-react";
import adminService from "../../services/adminService";
import bookingService from "../../services/bookingService";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllBookings({ search });
      setBookings(res.data.data);
    } catch (err) {
      console.error("MISSION_FETCH_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      
      {/* --- HUD HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            Mission <span className="text-slate-300 font-light not-italic">Logs.</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Total_Fleet_Missions: {bookings.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="FILTER_MISSION_ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-600/5 transition-all outline-none shadow-sm"
            />
          </div>
          <button onClick={fetchBookings} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- MAIN DATA TERMINAL --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Mission_ID</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset_Target</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Node_Personnel</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Telemetry_Status</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial_Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((b) => (
                <tr 
                  key={b._id} 
                  onClick={() => navigate(`/admin/bookings/${b._id}`)}
                  className="group hover:bg-slate-50/60 transition-all cursor-pointer"
                >
                  {/* Mission ID & Date */}
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">
                        {b.bookingId || b._id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={10} />
                        <span className="text-[9px] font-bold uppercase">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>

                  {/* Appliance Name */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Box size={14} />
                      </div>
                      <p className="text-xs font-black text-slate-900 uppercase italic">
                        {b.appliance?.name || "System_Maintenance"}
                      </p>
                    </div>
                  </td>

                  {/* Users / Personnel */}
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <User size={10} className="text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-600">{b.user?.firstName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardHat size={10} className="text-slate-300" />
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${b.technician ? 'text-indigo-600' : 'text-amber-500 italic'}`}>
                          {b.technician?.firstName || "WAITING_FOR_ASSIGNMENT"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-8 py-6">
                    <StatusBadge status={b.status} />
                  </td>

                  {/* Financials */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 text-slate-900">
                      <IndianRupee size={12} strokeWidth={3} />
                      <span className="text-sm font-black italic tracking-tighter">
                        {b.actualCost?.total || b.estimatedCost?.total}
                      </span>
                    </div>
                  </td>

                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
             Registry_Module // Fleet_Mission_Control_Active
           </p>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Status Logic
const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-50 border-emerald-100 text-emerald-600",
    pending: "bg-amber-50 border-amber-100 text-amber-600",
    confirmed: "bg-blue-50 border-blue-100 text-blue-600",
    cancelled: "bg-rose-50 border-rose-100 text-rose-600",
    in_progress: "bg-indigo-50 border-indigo-100 text-indigo-600",
  };

  return (
    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border w-fit flex items-center gap-2 ${styles[status] || "bg-slate-50 text-slate-500"}`}>
      <div className={`w-1 h-1 rounded-full bg-current ${status === 'in_progress' ? 'animate-pulse' : ''}`} />
      {status}
    </div>
  );
};

export default Bookings;