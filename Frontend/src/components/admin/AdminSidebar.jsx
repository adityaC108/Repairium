import React from 'react';
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  HardHat, 
  ClipboardList, 
  LogOut,
  Cpu,
  User2,
} from "lucide-react";

const AdminSidebar = () => {
  const menuGroups = [
    {
      group: "Telemetry",
      links: [
        { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Profile", path: "/admin/profile", icon: <User2 size={18} /> },
      ]
    },
    {
      group: "Registry_Nodes",
      links: [
        { name: "Client_Base", path: "/admin/users", icon: <Users size={18} /> },
        { name: "Technician_Base", path: "/admin/technicians", icon: <HardHat size={18} /> },
      ]
    },
    {
      group: "Mission_Control",
      links: [
        { name: "All_Bookings", path: "/admin/bookings", icon: <ClipboardList size={18} /> },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 p-6 border-r border-slate-800">
      
      {/* --- BRAND LOGO SECTION --- */}
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Cpu size={22} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] leading-none">Engine_v3</h2>
          <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Admin_Terminal</p>
        </div>
      </div>

      {/* --- NAVIGATION REGISTRY --- */}
      <nav className="flex-1 space-y-8">
        {menuGroups.map((group) => (
          <div key={group.group}>
            <h3 className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.links.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 group ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                        : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    {link.icon}
                  </span>
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* --- SYSTEM FOOTER --- */}
      <div className="pt-6 border-t border-slate-800 space-y-4">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all">
          <LogOut size={18} />
          Terminate_Session
        </button>
        
        <div className="px-4 py-4 bg-slate-800/50 rounded-2xl border border-slate-800">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Core_Sync</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
           </div>
           <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-indigo-500 rounded-full" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;