import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import { Lock, RefreshCw, CheckCircle, ShieldCheck, AlertCircle, Timer, Key } from "lucide-react";
import API from "../../services/api";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });

  useEffect(() => {
    let interval;
    if (success && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      navigate("/");
    }
    return () => clearInterval(interval);
  }, [success, countdown, navigate]);

  const handleChange = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("MATCH_ERROR: New credentials do not align.");
      return;
    }

    setLoading(true);
    try {
      await API.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "RECONCILIATION_FAILED: Check current key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔥 CENTERING WRAPPER: Ensures the card is in the middle of the screen/container */
    <div className="w-full min-h-[70vh] flex items-center justify-center p-4 mt-20">
      
      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-[3.5rem] p-12 border border-slate-800 text-center space-y-6 w-full max-w-xl shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Security_Registry_Synced</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Credentials successfully updated in the core matrix.</p>
          
          <div className="flex items-center justify-center gap-3 pt-6 text-indigo-400">
            <Timer size={16} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Redirecting_In: 00:0{countdown}</span>
          </div>
        </motion.div>
      ) : (
        /* --- CHANGE PASSWORD CARD --- */
        <div className="bg-white rounded-[3.5rem] p-10 lg:p-14 border border-slate-100 shadow-xl w-full max-w-2xl relative overflow-hidden">
          {/* Decorative ID Node */}
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Lock size={150} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
                <Key size={20} className="text-indigo-600" /> Security_Update
              </h3>
              <div className="hidden md:block px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Protocol: AES-256_Auth
              </div>
            </div>
            
            {error && (
              <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 flex items-center gap-3 text-rose-600">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}

            <form onSubmit={handleChange} className="space-y-10">
              {/* Current Password */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current_Security_Key</label>
                <input 
                  type="password" required value={form.currentPassword}
                  onChange={(e) => setForm({...form, currentPassword: e.target.value})}
                  className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold focus:ring-2 ring-indigo-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New_Registry_Key</label>
                  <input 
                    type="password" required value={form.newPassword}
                    onChange={(e) => setForm({...form, newPassword: e.target.value})}
                    className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold focus:ring-2 ring-indigo-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm_Registry_Key</label>
                  <input 
                    type="password" required value={form.confirmPassword}
                    onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                    className={`w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold focus:ring-2 transition-all outline-none ${
                      form.confirmPassword && form.newPassword !== form.confirmPassword 
                        ? 'ring-rose-500' 
                        : 'ring-indigo-500'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  disabled={loading} 
                  className="w-full px-10 py-6 bg-slate-900 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 shadow-2xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <RefreshCw size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  {loading ? "Re-Encrypting..." : "Initialize_Update_Protocol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;