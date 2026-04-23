import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, PieChart as PieIcon, 
  BarChart3, Box, Zap, ShieldCheck, 
  ChevronRight, IndianRupee, Activity, Database,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import applianceService from '../../services/applianceService';

const Appliances = () => {
  const navigate = useNavigate();
  const [appliances, setAppliances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // ✅ New Loading State

  const [pagination, setPagination] = useState({
    current: 1,
    hasNext: false,
    hasPrev: false,
    pages: 3,
    total: 0
  });
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [appRes, statRes] = await Promise.all([
        applianceService.getAllAppliances(),
        applianceService.getStatistics()
      ]);
      console.log("Appliances:", appRes);
      console.log("Statistics:", statRes);
      setAppliances(appRes.data.data); // Mapping to data array
      setPagination(appRes.data.pagination); 
      setStats(statRes?.data); // Mapping to the Statistics object
    } catch (err) {
      console.error("REGISTRY_FETCH_FAILURE", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!pagination.hasNext || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = pagination.current + 1;
      const res = await applianceService.getAllAppliances({ page: nextPage, limit: 10 });
      
      // Append new nodes to existing matrix
      setAppliances(prev => [...prev, ...res.data.data]);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("PAGINATION_SYNC_ERROR", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <div className="p-20 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-center">Reconciling_Asset_Telemetry...</div>;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* --- HUD HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database size={14} className="text-indigo-600" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Registry_Status // ACTIVE</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            Asset <span className="text-slate-200 font-light not-italic">Matrix.</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
           <div className="flex-1 lg:flex-none px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global_Avg_Price</p>
              <p className="text-xl font-black italic text-slate-900">₹{stats?.overall?.averagePrice.toFixed(2)}</p>
           </div>
           <button 
            onClick={() => navigate('/admin/appliances/new')}
            className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
          >
            Deploy_Asset
          </button>
        </div>
      </div>

      {/* --- TELEMETRY HUD --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Volume (Pie) */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <PieIcon size={14} className="text-indigo-600" /> Load_Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.byCategory}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {stats?.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Price Variation by Brand (Bar) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <BarChart3 size={14} className="text-emerald-500" /> Price_Index_Per_Brand
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byBrand}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} fontWeight={900} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '15px', border: 'none' }}
                />
                <Bar dataKey="averagePrice" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- REGISTRY MATRIX --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {appliances?.map((item) => (
          <div 
            key={item._id}
            onClick={() => navigate(`/admin/appliances/${item._id}`)}
            className="group bg-white rounded-[2.5rem] border border-slate-100 p-5 hover:border-indigo-200 transition-all cursor-pointer relative"
          >
            {/* Asset Header */}
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${item.category === 'large' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {item.category}
              </span>
              <div className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`} />
            </div>

            {/* Visual Registry */}
            <div className="aspect-square bg-slate-50 rounded-[2rem] mb-5 flex items-center justify-center overflow-hidden border border-slate-50">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <Box size={32} className="text-slate-200" />
              )}
            </div>

            {/* Telemetry Labels */}
            <div className="space-y-1 px-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.brand}</p>
              <h4 className="text-xs font-black text-slate-900 uppercase italic truncate">{item.name}</h4>
              <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center gap-1">
                    <IndianRupee size={10} className="text-slate-400" />
                    <span className="text-xs font-black tracking-tighter">{item.totalPrice}</span>
                 </div>
                 <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Technical Detail Badge */}
            <div className="absolute bottom-24 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[7px] font-mono bg-slate-900 text-white px-2 py-1 rounded">ID_{item._id.slice(-4).toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- PAGINATION HUD --- */}
      <div className="mt-12 flex flex-col items-center gap-6 border-t border-slate-100 pt-12">
        
        {pagination.hasNext ? (
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group flex items-center gap-4 px-10 py-5 bg-white border-2 border-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
            )}
            {loadingMore ? "Fetching_Nodes..." : "Expand_Fleet_Registry"}
          </button>
        ) : (
          <div className="flex items-center gap-4 text-slate-300">
             <div className="h-px w-12 bg-slate-100" />
             <p className="text-[9px] font-black uppercase tracking-[0.4em]">End_Of_Registry_Matrix</p>
             <div className="h-px w-12 bg-slate-100" />
          </div>
        )}

        <div className="flex items-center gap-6">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
             Showing: {appliances.length} // Total_Capacity: {pagination.total}
           </p>
        </div>
      </div>
    </div>
  );
};

export default Appliances;