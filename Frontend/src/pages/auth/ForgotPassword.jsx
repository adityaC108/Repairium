import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import API from "../../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/reset-password-request", { email });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "RECOVERY_LINK_FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
        {!success ? (
          <>
            <button onClick={() => navigate(-1)} className="p-3 bg-slate-800 text-slate-400 rounded-2xl mb-8 hover:text-white transition-all">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Recover <span className="text-slate-600">Access.</span></h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Initialize password recovery protocol</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry_Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border-b-2 border-slate-700 py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all"
                    placeholder="OPERATOR@REPAIRIUM.SYS"
                  />
                </div>
              </div>
              <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all">
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Dispatch_Recovery_Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Link_Dispatched</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
              Check your registry inbox for the secure handshake link to reset your credentials.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;