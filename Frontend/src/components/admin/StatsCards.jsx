import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, HardHat, ClipboardList, IndianRupee, ArrowUpRight, TrendingUp } from "lucide-react";

const StatsCards = ({ stats }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Client_Nodes",
      value: stats.users.total,
      sub: `+${stats.users.newThisMonth} this month`,
      icon: <Users size={20} />,
      color: "text-blue-500",
      bg: "bg-blue-50",
      path: "/admin/users" // 🔥 Target Route
    },
    {
      title: "Service_Fleet",
      value: stats.technicians.total,
      sub: `${stats.technicians.verified} Verified Nodes`,
      icon: <HardHat size={20} />,
      color: "text-orange-500",
      bg: "bg-orange-50",
      path: "/admin/technicians" // 🔥 Target Route
    },
    {
      title: "Active_Missions",
      value: stats.bookings.total,
      sub: `${stats.bookings.completed} Finalized`,
      icon: <ClipboardList size={20} />,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      path: "/admin/bookings" // 🔥 Target Route
    },
    {
      title: "Gross_Revenue",
      value: `₹${stats.revenue.total.toLocaleString()}`,
      sub: `₹${stats.revenue.thisMonth.toLocaleString()} Period_Current`,
      icon: <IndianRupee size={20} />,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      path: "/admin/reports" // 🔥 Target Route (Financial Analytics)
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          onClick={() => navigate(card.path)} // 🔥 Initializing Navigation Protocol
          className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-100 hover:border-indigo-600 transition-all duration-500 relative overflow-hidden cursor-pointer active:scale-95"
        >
          {/* Background Decorative Element */}
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
            {React.cloneElement(card.icon, { size: 120 })}
          </div>

          <div className="flex justify-between items-start mb-6">
            <div className={`p-3.5 ${card.bg} ${card.color} rounded-2xl transition-transform group-hover:scale-110 duration-500`}>
              {card.icon}
            </div>
            <div className="text-slate-200 group-hover:text-indigo-600 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {card.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-slate-900 tracking-tighter italic">
                {card.value}
              </p>
              {index === 0 && (
                <div className="flex items-center text-emerald-500 gap-0.5 animate-pulse">
                  <TrendingUp size={12} />
                  <span className="text-[9px] font-black uppercase">Live</span>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              {card.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;