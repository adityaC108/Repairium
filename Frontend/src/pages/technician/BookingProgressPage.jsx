import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle, Package, MessageSquare, 
  ArrowLeft, Clock, MapPin, Shield, AlertTriangle 
} from 'lucide-react';
import technicianServices from '../../services/technicianService';

const BookingProgressPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [mongoId, setMongoId] = useState(null);
  
  // Progress Form State
  const [notes, setNotes] = useState('');
  const [spareParts, setSpareParts] = useState(0);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      // Reusing getBookings with an ID filter or creating a getBookingById
      const response = await technicianServices.getBookings();
      const bookingsArray = response?.data?.data || response?.data?.bookings || [];
      
      // Match by MongoDB _id
      const found = bookingsArray.find(b => b.bookingId === bookingId);
      if (found){
        setMongoId(found._id);
        setBooking(found);
        setNotes(found?.technicianNotes || '');
      }
      else{
        alert("Booking not found");
        navigate("/technician/bookings");
      }
    } catch (err) {
      console.error("Failed to load node details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (nextStatus) => {
    try {
      setUpdating(true);
      const payload = {
        status: nextStatus,
        technicianNotes: notes,
        sparePartsCost: nextStatus === 'completed' ? spareParts : undefined
      };

      await technicianServices.updateBookingStatus(mongoId, payload);
      await fetchBookingDetails(); // Refresh UI
    } catch (err) {
      alert("Status Sync Failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.4em]">Initializing_Protocol...</div>;

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      {/* Navigation Header */}
      <nav className="pt-24 pb-8 px-6 lg:px-12 border-b border-slate-50 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back_to_Fleet
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-slate-300">ID: {booking.bookingId}</span>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* --- LEFT: STATUS CONTROL ENGINE --- */}
          <div className="lg:col-span-7 space-y-12">
            <header>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Active_Mission</span>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none mt-2">
                {booking.appliance?.name}
              </h1>
            </header>

            {/* Stepper Logic */}
            <div className="space-y-6">
              <StatusStep 
                active={booking.status === 'confirmed'} 
                completed={['in_progress', 'completed'].includes(booking.status)}
                title="1. Assignment Confirmed"
                desc="Node locked. Prepare tools and initialize transit."
              />
              <StatusStep 
                active={booking.status === 'in_progress'} 
                completed={booking.status === 'completed'}
                title="2. Service In-Progress"
                desc="Diagnostics and repairs active on-site."
              />
              <StatusStep 
                active={booking.status === 'completed'} 
                completed={booking.status === 'completed'}
                title="3. Finalization"
                desc="Node resolution and payment reconciliation."
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-8 border-t border-slate-50 flex flex-col gap-4">
              {booking.status === 'confirmed' && (
                <ActionButton 
                  onClick={() => handleStatusUpdate('in_progress')}
                  loading={updating}
                  icon={<Play size={30} />}
                  label="Initialize_Service_Mode"
                  color="bg-slate-900"
                />
              )}

              {booking.status === 'in_progress' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician_Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="LOG_REPAIR_DETAILS_HERE..."
                      className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px]"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spare_Parts_Cost (₹)</label>
                    <input 
                      type="number"
                      value={spareParts}
                      onChange={(e) => setSpareParts(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <ActionButton 
                    onClick={() => handleStatusUpdate('completed')}
                    loading={updating}
                    icon={<CheckCircle size={18} />}
                    label="Execute_Final_Completion"
                    color="bg-indigo-600"
                  />
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center gap-6">
                   <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                     <Shield size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Mission_Status</p>
                     <p className="text-lg font-black text-emerald-900 tracking-tight">NODE_RESOLVED_SUCCESSFULLY</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT: MISSION METADATA --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-200">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-10">Client_Manifest</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Preferred_Window</p>
                      <p className="text-sm font-bold">{new Date(booking.preferredDate).toLocaleDateString()} // {booking.preferredTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deployment_Address</p>
                      <p className="text-sm font-bold">{booking.serviceAddress?.street}, {booking.serviceAddress?.city}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">User_Log</p>
                      <p className="text-sm font-bold italic opacity-70">"{booking.issueDescription}"</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Safety_Protocol</span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Always verify unit power-down before initiating hardware diagnostics. Wear required anti-static equipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const StatusStep = ({ active, completed, title, desc }) => (
  <div className={`flex gap-6 transition-opacity ${!active && !completed ? 'opacity-30' : 'opacity-100'}`}>
    <div className="flex flex-col items-center">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${completed ? 'bg-indigo-600 border-indigo-600 text-white' : active ? 'border-indigo-600' : 'border-slate-200'}`}>
        {completed && <CheckCircle size={12} />}
      </div>
      <div className="w-px h-full bg-slate-100 mt-2" />
    </div>
    <div className="pb-8">
      <h4 className={`text-sm font-black uppercase tracking-tighter ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h4>
      <p className="text-xs text-slate-400 font-medium mt-1">{desc}</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, loading, icon, label, color }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`w-full py-6 ${color} text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-[0.98] active:scale-95 flex items-center justify-center gap-4 shadow-xl shadow-slate-200 disabled:opacity-50`}
  >
    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : icon}
    {loading ? 'Synchronizing...' : label}
  </button>
);

export default BookingProgressPage;