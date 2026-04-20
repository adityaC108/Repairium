import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, FileText, Download, 
  X, CheckCircle2, Clock, DollarSign, 
  Star, ExternalLink, Calendar, MapPin
} from 'lucide-react';
import technicianServices from '../../services/technicianService';

const CompletedBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await technicianServices.getBookings();
      const myData = response?.data?.data || response?.data?.bookings || [];
      
      // Filter for COMPLETED nodes only
      const history = myData.filter(b => b.status === 'completed');
      setBookings(history);
    } catch (err) {
      console.error("Archive Retrieval Failure", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = bookings.filter(b => 
    b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Accessing_Archives...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="pt-24 pb-12 px-6 lg:px-12 border-b border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Data_History</span>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter italic leading-none">
              Archive <span className="text-slate-200 font-light">Terminal</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 size={16} />
              <span className="text-xs font-black uppercase tracking-widest">{bookings.length} Missions_Resolved</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Search */}
        <div className="relative mb-8 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="SEARCH_BY_ID_OR_CLIENT_NAME..."
            className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Archives Table */}
        <div className="overflow-hidden border border-slate-100 rounded-[2rem] bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resolution_Date</th>
                <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Node_Identity</th>
                <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((b) => (
                <tr key={b._id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6">
                    <p className="text-xs font-black text-slate-900 uppercase">
                      {new Date(b.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{new Date(b.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{b.appliance?.name}</p>
                    <p className="text-[10px] font-mono text-slate-300 uppercase">{b.bookingId}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-slate-600 uppercase">{b.user?.firstName} {b.user?.lastName}</p>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-sm font-black text-slate-900">₹{b.actualCost?.total}</p>
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => setSelectedBooking(b)}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <div className="py-20 text-center">
              <History size={40} className="mx-auto text-slate-100 mb-4" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Archives_Empty</p>
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL: NODE RESOLUTION REPORT --- */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              onClick={() => setSelectedBooking(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="bg-slate-900 p-8 md:p-12 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Final_Resolution_Report</span>
                  </div>
                  <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                    {selectedBooking.appliance?.name}
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-widest">
                    Synchronized_ID: {selectedBooking.bookingId}
                  </p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 md:p-12 space-y-12 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Metric label="Service_Time" value= {selectedBooking.duration} icon={<Clock size={16}/>} />
                  <Metric label="Outcome" value="Resolved" icon={<CheckCircle2 size={16}/>} />
                  <Metric label="Rating" value={selectedBooking.rating?.score ? `${selectedBooking.rating.score}/5` : 'Pending'} icon={<Star size={16}/>} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-100 pt-12">
                  {/* Financial Breakdown */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Economic_Breakdown</h4>
                    <div className="space-y-4 bg-slate-50 p-8 rounded-[2rem]">
                      <FeeLine label="Base_Fee" amount={selectedBooking.actualCost?.basePrice} />
                      <FeeLine label="Service_Charge" amount={selectedBooking.actualCost?.serviceCharge} />
                      <FeeLine label="Spare_Parts" amount={selectedBooking.actualCost?.sparePartsCost} />
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <span className="text-[11px] font-black text-indigo-600 uppercase">Total_Revenue</span>
                        <span className="text-xl font-black text-slate-900 italic">₹{selectedBooking.actualCost?.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Log Details */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution_Notes</h4>
                    <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[2rem]">
                      <p className="text-sm font-bold text-slate-700 italic leading-relaxed">
                        "{selectedBooking.technicianNotes || 'No additional technical logs provided for this node.'}"
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Detail icon={<Calendar size={14}/>} label="Deployment" val={new Date(selectedBooking.preferredDate).toLocaleDateString()} />
                      <Detail icon={<MapPin size={14}/>} label="Node_Loc" val={`${selectedBooking.serviceAddress?.city}, ${selectedBooking.serviceAddress?.pincode}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 transition-all">
                  <Download size={14} /> Download_Invoice
                </button>
                <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
                  <ExternalLink size={14} /> Request_Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Helper UI Components ---

const Metric = ({ label, value, icon }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{value}</p>
    </div>
  </div>
);

const FeeLine = ({ label, amount }) => (
  <div className="flex justify-between items-center text-[10px] font-bold">
    <span className="text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="font-mono text-slate-900">₹{amount || 0}</span>
  </div>
);

const Detail = ({ icon, label, val }) => (
  <div className="flex items-center gap-3 text-slate-400">
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}:</span>
    <span className="text-[10px] font-bold text-slate-600 uppercase">{val}</span>
  </div>
);

export default CompletedBookingsPage;