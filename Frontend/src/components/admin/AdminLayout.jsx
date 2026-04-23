import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, ChevronRight, User } from 'lucide-react';
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  // Logic for Breadcrumbs (Can be expanded with useLocation)
  const currentModule = "Registry_Control"; 

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 mt-20">
      {/* --- SIDEBAR NAVIGATION --- */}
      {/* Fixed width, high-contrast container */}
      <aside className="w-[280px] fixed left-0 top-0 h-full z-50 bg-slate-900 shadow-2xl mt-20">
        <AdminSidebar />
      </aside>

      {/* --- MAIN INTERFACE --- */}
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        
        {/* --- GLOBAL TOP HUD --- */}
        {/* <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Shield size={16} />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <span>Admin</span>
              <ChevronRight size={12} className="text-slate-200" />
              <span className="text-indigo-600">{currentModule}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="h-8 w-[1px] bg-slate-100" />

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">System_Admin</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Operational</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-2xl border-2 border-transparent group-hover:border-indigo-600 transition-all flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
            </div>
          </div>
        </header> */}

        {/* --- DYNAMIC VIEWPORT --- */}
        <main className="flex-1 p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto"
          >
            {/* Contextual Logic wrapper for all admin children */}
            <section className="relative">
              {children}
            </section>
          </motion.div>
        </main>

        {/* --- SYSTEM FOOTER --- */}
        <footer className="px-12 py-6 border-t border-slate-50 flex justify-between items-center">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
             Engine_v3 // Administrative_Terminal
           </p>
           <div className="flex gap-4">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Registry_Sync: OK</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Uptime: 99.9%</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;