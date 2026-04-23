import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  ShieldAlert, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  RefreshCw,
  ClipboardList
} from "lucide-react";
import StatsCards from "../../components/admin/StatsCards";
import adminService from "../../services/adminService";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await adminService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error("DASHBOARD_SYNC_ERROR:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center font-mono text-[10px] tracking-[0.5em] text-slate-400">
        <Activity className="animate-spin mb-4 text-indigo-600" size={24} />
        INITIALIZING_SYSTEM_TELEMETRY...
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* --- HUD HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded">v3.4.0_Stable</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System_Uptime: 99.9%</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-slate-900">
            Control <span className="text-slate-300 font-light not-italic">Center.</span>
          </h1>
        </div>

        <button 
          onClick={fetchStats}
          className={`flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg active:scale-95 ${refreshing ? 'text-indigo-600' : 'text-slate-500'}`}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Sync_Data
        </button>
      </header>

      {/* --- TOP TIER: PRIMARY NODES --- */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDE: FLEET & REVENUE LOGS (8-cols) --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Service Fleet Metrics */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <Zap size={16} className="text-amber-500" /> Fleet_Deployment_Metrics
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Real-time_Sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <MetricItem 
                label="Verified_Units" 
                val={stats.technicians.verified} 
                sub="Authorized Fleet" 
                icon={<CheckCircle2 className="text-emerald-500" />} 
              />
              <MetricItem 
                label="Pending_Audit" 
                val={stats.technicians.pendingVerification} 
                sub="In Verification Pipe" 
                icon={<ShieldAlert className="text-rose-500 animate-pulse" />} 
                highlight
              />
              <MetricItem 
                label="Network_Growth" 
                val={stats.users.newThisMonth} 
                sub="New Clients (30d)" 
                icon={<BarChart3 className="text-indigo-500" />} 
              />
            </div>
          </section>

          {/* Section: Mission Status Breakdown */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10">
                <ClipboardList size={120} />
             </div>
             
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10 relative z-10">
               Mission_Success_Registry
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Finalized</p>
                   <p className="text-4xl font-black italic tracking-tighter">{stats.bookings.completed}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Successful Missions</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Active_Wait</p>
                   <p className="text-4xl font-black italic tracking-tighter">{stats.bookings.pending}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Deployment</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Aborted</p>
                   <p className="text-4xl font-black italic tracking-tighter">{stats.bookings.cancelled}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase">System Cancellations</p>
                </div>
             </div>
          </section>
        </div>

        {/* --- RIGHT SIDE: SYSTEM INTEGRITY (4-cols) --- */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-full">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8">
                Asset_Inventory
              </h3>
              
              <div className="space-y-6 flex-1">
                 <InventoryBar label="Appliances_Total" val={stats.appliances.total} total={stats.appliances.total} color="bg-indigo-600" />
                 <InventoryBar label="Operational_Nodes" val={stats.appliances.active} total={stats.appliances.total} color="bg-emerald-500" />
                 <InventoryBar label="Market_Reach" val="84%" total={100} color="bg-amber-500" />
              </div>

              <div className="mt-12 pt-8 border-t border-slate-50">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Revenue_Performance</p>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">₹{stats.revenue.thisMonth.toLocaleString()}</p>
                    <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">Current_Monthly_Yield</p>
                 </div>
              </div>
           </section>
        </div>

      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const MetricItem = ({ label, val, sub, icon, highlight }) => (
  <div className={`p-6 rounded-3xl transition-all duration-300 ${highlight ? 'bg-rose-50/50 border border-rose-100' : 'bg-slate-50 border border-transparent'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
    </div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-900 tracking-tighter">{val}</p>
    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{sub}</p>
  </div>
);

const InventoryBar = ({ label, val, total, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-900">{val}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${(val/total) * 100}%` }} 
        className={`h-full ${color} rounded-full`} 
      />
    </div>
  </div>
);

export default Dashboard;