import React, { useState, useEffect } from 'react';
import technicianServices from '../../services/technicianService';
import {
  Wallet, Star, CheckCircle, MapPin, Wrench,
  Clock, AlertCircle, Power,
  BarChart,
  ShieldCheck,
  User,
  ArrowRight,
  Cpu
} from 'lucide-react';
import TechnicianStats from '../../components/technician/TechnicianStats';
import TechnicianProfile from '../../components/technician/TechnicianProfile';
import Navbar from '../../components/layout/Navbar';
import notificationService from '../../services/notificationService';
import { AnimatePresence, motion } from 'framer-motion';

const TechnicianDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [view, setView] = useState('overview');

  const loadStats = async () => {
    try {
      setIsUpdating(true);
      const res = await technicianServices.getStats();
      setStats(res.data);
      setShowStats(true);
    } catch (err) {
      alert("Failed to load statistics");
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const result = await technicianServices.getProfile();
        setData(result.data);
        
        // Initialize notification service when user data is loaded
        if (result.data?.technician || result.data?.user) {
          const user = result.data.technician || result.data.user;
          notificationService.initialize(user);
          
          // Set up notification listeners
          setupNotificationListeners();
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard. Please login.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Setup notification listeners
  const setupNotificationListeners = () => {
    // Listen for new booking requests
    notificationService.on('new_booking_request', (data) => {
      console.log('New booking request received:', data);
      // Show alert or update UI
      if (data.booking.priority === 'urgent' || data.booking.serviceType === 'emergency') {
        alert(`URGENT: New ${data.booking.serviceType} booking request in ${data.booking.serviceAddress.city}!`);
      }
    });

    // Listen for booking assignment
    notificationService.on('booking_assigned', (data) => {
      console.log('Booking assigned:', data);
      // Update status to busy
      if (data.booking.technician === data?.technicianId) {
        notificationService.updateTechnicianStatus('busy');
      }
    });

    // Listen for payment notifications
    notificationService.on('payment_received', (data) => {
      console.log('Payment received:', data);
      // Update earnings display
      if (data.payment.technician === profile?._id) {
        // Refresh stats to show new earnings
        loadStats();
      }
    });

    // Listen for review notifications
    notificationService.on('new_review', (data) => {
      console.log('New review received:', data);
      // Update rating display
      if (data.review.technician === profile?._id) {
        // Refresh profile data to show new rating
        window.location.reload();
      }
    });

    // Listen for verification status updates
    notificationService.on('verification_status_updated', (data) => {
      console.log('Verification status updated:', data);
      if (data.verificationStatus === 'verified') {
        alert('Congratulations! Your profile has been verified.');
        window.location.reload();
      }
    });

    // Cleanup on unmount
    return () => {
      notificationService.off('new_booking_request');
      notificationService.off('booking_assigned');
      notificationService.off('payment_received');
      notificationService.off('new_review');
      notificationService.off('verification_status_updated');
    };
  };

  // Handle Online/Offline toggle
  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      const newStatus = !profile.isOnline;
      await technicianServices.updateStatus(newStatus);
      // Optimistic UI update or re-fetch
      setData(prev => ({
        ...prev,
        technician: { ...profile, isOnline: newStatus }
      }));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return console.log(error)
  if (error) return <ErrorScreen message={error} />;

  const profile = data?.technician || data?.user;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <main className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in duration-700">

          {view === 'overview' ? (
            <>
              {/* --- HUD HEADER --- */}
              <header className="flex flex-col lg:flex-row mt-16 justify-between items-end mb-20 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-200 transition-transform group-hover:rotate-12">
                        <Cpu className="text-white" size={32} />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${profile?.isOnline ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`} />
                    </div>
                    <div>
                      <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none italic">
                        Command <span className="text-slate-200 font-light">Center</span>
                      </h1>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Node Active</span>
                        <div className="h-px w-12 bg-slate-100" />
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100">
                          v{profile?._id?.slice(-3) || '3.0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Navigation Actions */}
                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-slate-100 shadow-sm">
                  <button
                    disabled={isUpdating}
                    onClick={handleToggleStatus}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${profile?.isOnline
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100'
                      : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-rose-600'
                      }`}
                  >
                    <Power size={14} className={isUpdating ? 'animate-spin' : ''} />
                    {profile?.isOnline ? 'System Live' : 'Go Online'}
                  </button>

                  <button
                    onClick={() => {
                      // If we are opening the stats, load the fresh data
                      if (!showStats) loadStats();

                      // Toggle the visibility state
                      setShowStats(!showStats);
                    }}
                    className={`p-4 rounded-2xl transition-all active:scale-95 border-2 ${showStats
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-500 hover:text-indigo-600 shadow-sm'
                      }`}
                    title={showStats ? "Collapse Metrics" : "Expand Metrics"}
                  >
                    <BarChart size={20} className={showStats ? 'animate-pulse' : ''} />
                  </button>

                  <button
                    onClick={() => setView('settings')}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                  >
                    <User size={14} className="text-indigo-600" /> Settings
                  </button>
                </div>
              </header>

              <AnimatePresence>
                {showStats && (
                  <motion.section
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-20"
                  >
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                          <h3 className="text-xl font-black italic tracking-tighter">Real-time <span className="text-slate-300">Metrics</span></h3>
                        </div>
                        <button
                          onClick={() => setShowStats(false)}
                          className="text-[10px] font-black text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors"
                        >
                          Close Analytics [ESC]
                        </button>
                      </div>

                      {/* This is where your actual charts component lives */}
                      <TechnicianStats stats={stats} />
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* --- ANALYTICS HUD --- */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                <StatBox
                  icon={<Wallet />}
                  label="Treasury"
                  value={`₹${profile?.earnings?.total}`}
                  sub={`₹${profile?.earnings?.pending} floating`}
                  trend="+12%"
                />
                <StatBox
                  icon={<Star />}
                  label="Reputation"
                  value={profile?.rating?.average || '0'}
                  sub={`${profile?.rating?.count} nodes`}
                  trend="98%"
                />
                <StatBox
                  icon={<CheckCircle />}
                  label="Efficiency"
                  value={`${profile?.completionRate}%`}
                  sub="Task completion"
                  trend="HIGH"
                />
                <StatBox
                  icon={<Wrench />}
                  label="Runtime"
                  value={`${profile?.experience}Y`}
                  sub="Senior Level"
                  trend="MASTER"
                />
              </section>

              {/* --- DATA VISUALIZATION AREA --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Metadata & Status */}
                <div className="lg:col-span-4 space-y-12">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Specialization</p>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map((s, i) => (
                        <span key={i} className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black border border-slate-100 uppercase tracking-widest shadow-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Systems Verification</p>
                    <div className="space-y-3">
                      <StatusNode label="Access Protocol" ok={profile?.isActive} />
                      <StatusNode label="Identity Sync" ok={profile?.isVerified} />
                      <StatusNode label="Treasury Gateway" ok={profile?.bankDetails?.isVerified} />
                    </div>
                  </div>
                </div>

                {/* Right Column: Spatial Tracking Table */}
                <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
                  <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                      <h3 className="text-xl font-black italic tracking-tighter">Spatial <span className="text-slate-300">Tracking</span></h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">Active Zones</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-300 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-50">
                          <th className="px-10 py-6">Region Node</th>
                          <th className="px-10 py-6">Geocode</th>
                          <th className="px-10 py-6 text-right">Coverage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {profile?.serviceAreas?.map((area) => (
                          <tr key={area._id} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-10 py-8">
                              <p className="font-black text-slate-800 uppercase tracking-tight text-sm group-hover:text-indigo-600 transition-colors">
                                {area.city}, {area.state}
                              </p>
                            </td>
                            <td className="px-10 py-8">
                              <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md tracking-tighter">
                                {area.pincode}
                              </span>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <span className="text-[11px] font-black italic text-slate-900">
                                {area.serviceRadius} <span className="text-[9px] text-slate-300">KM</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* SETTINGS VIEW */
            <div className="animate-in fade-in slide-in-from-bottom-4 mt-10 duration-700">
              <header className="flex items-center justify-between">
                <button
                  onClick={() => setView('overview')}
                  className="flex items-center gap-4 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.3em] group"
                >
                  <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-2 transition-transform" />
                  Exit To Command
                </button>
                <div className="h-px flex-1 bg-slate-100 mx-10" />
              </header>

              <TechnicianProfile
                initialData={profile}
                onUpdate={() => window.location.reload()}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// --- REDESIGNED HELPER COMPONENTS ---

const StatBox = ({ icon, label, value, sub, trend }) => (
  <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-gray-600 transition-colors">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md tracking-widest">
        {trend}
      </span>
    </div>
    <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{label}</p>
    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">{value}</h2>
    <p className="text-[11px] text-slate-400 font-medium mt-2">{sub}</p>
  </div>
);

const StatusNode = ({ label, ok }) => (
  <div className="flex justify-between items-center bg-white p-4 px-6 rounded-2xl border border-slate-100 shadow-sm">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      <span className={`text-[9px] font-black uppercase ${ok ? 'text-emerald-500' : 'text-rose-400'}`}>
        {ok ? 'Sync_OK' : 'Sync_Required'}
      </span>
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-xs font-black text-slate-400 tracking-widest uppercase animate-pulse">Synchronizing Data</span>
    </div>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-6">
    <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center border border-rose-100 max-w-sm">
      <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
      <h2 className="text-xl font-black text-slate-800 mb-2">Sync Interrupted</h2>
      <p className="text-slate-500 text-sm mb-6 font-medium">{message}</p>
      <button onClick={() => window.location.href = '/login'} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all">RE-AUTHENTICATE</button>
    </div>
  </div>
);

export default TechnicianDashboard;