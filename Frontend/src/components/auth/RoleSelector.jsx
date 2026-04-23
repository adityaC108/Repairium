import React from "react";
import { motion } from "framer-motion";
import { User, Wrench, ShieldCheck, ChevronRight } from "lucide-react";

const roles = [
  { 
    name: "user", 
    label: "Client_Node", 
    sub: "Request service, track missions, and manage assets.",
    icon: User,
    color: "indigo"
  },
  { 
    name: "technician", 
    label: "Technician_Node", 
    sub: "Accept missions, manage logistics, and sync field data.",
    icon: Wrench,
    color: "emerald"
  },
];

const RoleSelector = ({ setRole }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 relative overflow-hidden">
      {/* --- INDUSTRIAL BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        {/* --- HEADER TELEMETRY --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full mb-4">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
              System_Access_Gateway // v3.0
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white leading-none">
            Identify <span className="text-slate-500 font-light not-italic">Operator.</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">
            Select your functional role to initialize secure link
          </p>
        </div>

        {/* --- ROLE NODES --- */}
        <div className="flex flex-col gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isTech = role.name === "technician";

            return (
              <motion.button
                key={role.name}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole(role.name)}
                className="w-full group relative flex items-center justify-between p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all text-left"
              >
                <div className="flex items-center gap-6">
                  {/* Icon Anchor */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isTech 
                      ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" 
                      : "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white"
                  }`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:italic transition-all">
                      {role.label}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1 leading-tight max-w-[200px]">
                      {role.sub}
                    </p>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-all pr-4">
                  <ChevronRight size={20} className="text-slate-400" />
                </div>

                {/* Decorative Tech Corner */}
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <p className="text-[10px] font-mono">0x{role.name.toUpperCase()}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <div className="mt-12 text-center">
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">
             Registry_Module // Authentication_Required
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;