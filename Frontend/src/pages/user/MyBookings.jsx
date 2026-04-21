import React, { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Wrench,
  X,
  CreditCard,
  Info,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  Package,
  History,
  EqualApproximately,
  FileText
} from "lucide-react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  pending: "border-amber-200 text-amber-600 bg-amber-50",
  confirmed: "border-indigo-200 text-indigo-600 bg-indigo-50",
  in_progress: "border-purple-200 text-purple-600 bg-purple-50",
  completed: "border-emerald-200 text-emerald-600 bg-emerald-50",
  cancelled: "border-rose-200 text-rose-600 bg-rose-50",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/users/bookings");
      setBookings(res.data?.data?.data || []);
    } catch (err) {
      console.error("REGISTRY_LOAD_FAIL:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-[10px] tracking-[0.4em] text-slate-400">
      <Activity className="animate-spin mb-4 text-indigo-600" size={24} />
      SYNCING_MISSION_REGISTRY...
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* --- HUD HEADER --- */}
      <header className="pt-32 pb-16 px-6 lg:px-12 border-b border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Service_Fleet_Control</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter italic leading-none uppercase">
              Mission <span className="text-slate-200 font-light not-italic">Logs.</span>
            </h1>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
              <History size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Node_Count</p>
              <p className="text-2xl font-black tracking-tighter text-slate-900 leading-none italic">{bookings.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- REGISTRY GRID --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {bookings.length === 0 ? (
          <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
            <Zap size={48} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Zero_Active_Missions</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedBooking(booking)}
                className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 cursor-pointer hover:border-indigo-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
              >
                {/* --- DUAL-STATUS HEADER --- */}
                <div className="flex justify-between items-start mb-10">
                  {/* Left: Mission Icon */}
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-all duration-500">
                    <History size={20} className="group-hover:rotate-[360deg] transition-transform duration-700" />
                  </div>

                  {/* Right: Status Stack */}
                  <div className="flex flex-col items-end gap-2">
                    {/* 1. Mission Status Badge */}
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${statusStyles[booking.status]}`}>
                      {booking.status.replace("_", " ")}
                    </span>

                    {/* 2. Financial Status Badge (Paid/Unpaid) */}
                    <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-1.5 ${booking.payment?.status === "paid"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}>
                      <div className={`w-1 h-1 rounded-full ${booking.payment?.status === "paid" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                      {booking.payment?.status === "paid" ? "Payment_Done" : "Payment_Pending"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">
                    {booking.appliance?.name}
                  </h3>
                  <p className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-tighter">
                    {booking.appliance?.brand} // {booking.bookingId}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {new Date(booking.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{booking.serviceAddress?.city}</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* --- SIDEBAR MISSION DETAIL OVERLAY --- */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Node_Deep_Analysis</p>
                  <h2 className="text-2xl font-black tracking-tighter italic uppercase">Mission Details</h2>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                {/* Visual ID Block */}
                <div className="flex gap-6 items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <p className="text-xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">
                      {selectedBooking.appliance?.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">
                      UID: {selectedBooking.bookingId}
                    </p>
                  </div>
                </div>

                {/* Configuration Matrix */}
                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Operational_Matrix</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DataPoint label="Priority" value={selectedBooking.priority} />
                    <DataPoint label="Service_Type" value={selectedBooking.serviceType} />
                    <DataPoint label="Scheduled_Date" value={new Date(selectedBooking.preferredDate).toLocaleDateString()} />
                    <DataPoint label="Time_Window" value={selectedBooking.preferredTime} />
                  </div>
                </section>

                {/* Spatial Mapping */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Spatial_Anchor</h4>
                  <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
                    <p className="text-xs font-bold text-slate-600 uppercase leading-relaxed">
                      {selectedBooking.serviceAddress?.street}, {selectedBooking.serviceAddress?.city},<br />
                      {selectedBooking.serviceAddress?.state} - {selectedBooking.serviceAddress?.pincode}
                    </p>
                  </div>
                </section>

                {/* Log Entry */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Issue_Log_Entry</h4>
                  <div className="p-6 bg-indigo-50/30 border border-indigo-100/50 rounded-[2rem] italic text-sm font-bold text-slate-700">
                    "{selectedBooking.issueDescription}"
                  </div>
                </section>

                {/* Billing Reconciliation */}
                <section className="space-y-6 pt-6 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Economic_Reconciliation</h4>
                  <div className="space-y-3">
                    <FeeLine label="Base_Deployment" amount={selectedBooking.estimatedCost?.basePrice} />
                    <FeeLine label="Spare_Parts_Node" amount={selectedBooking.estimatedCost?.sparePartsCost} />
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-black text-indigo-600 uppercase">Total_Liability</span>
                      <span className="text-3xl font-black text-slate-900 italic">₹{selectedBooking.estimatedCost?.total}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar Action Hub */}
              {/* Sidebar Action Hub */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                {selectedBooking.payment?.status === "pending" && selectedBooking.status !== "cancelled" ? (
                  <button
                    onClick={() => navigate(`/payment/${selectedBooking._id}`)}
                    className="group w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 active:scale-95 flex items-center justify-center gap-4"
                  >
                    <CreditCard size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                    Initialize_Payment_Protocol
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/payment/${selectedBooking._id}`)}
                    className="group w-full py-6 border-2 border-slate-200 bg-white text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:border-slate-900 hover:text-slate-900 flex items-center justify-center gap-4"
                  >
                    <FileText size={18} />
                    Access_Mission_Invoice
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const DataPoint = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-50 shadow-sm">
    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xs font-black text-slate-900 uppercase italic">{value}</p>
  </div>
);

const FeeLine = ({ label, amount }) => (
  <div className="flex justify-between items-center text-[10px] font-bold">
    <span className="text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="font-mono text-slate-900">₹{amount || 0}</span>
  </div>
);

export default MyBookings;