import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight, MailCheck } from "lucide-react";
import API from "../../services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Initializing_Verification_Sequence...");
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;
    const triggerVerification = async () => {
      const token = searchParams.get("token");
      const role = searchParams.get("role");

      setStatus("verifying");
      setMessage("Verifying_Your_Identity...");

      if (!token || !role) {
        setStatus("error");
        setMessage("PROTOCOL_ERR: Missing_Security_Token_Or_Role");
        return;
      }

      try {
        // Handshake with the backend
        const res = await API.get(`/auth/verify-email?token=${token}&role=${role}`);
        
        if (res.data.success) {
          setStatus("success");
          setMessage("IDENTITY_VERIFIED: Access_Granted_To_Matrix");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "VERIFICATION_FAILED: Link_Expired_Or_Invalid");
      }
    };

    triggerVerification();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* --- INDUSTRIAL BACKGROUND --- */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl"
      >
        {/* --- STATUS ICON NODE --- */}
        <div className="flex justify-center mb-8">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
            status === 'verifying' ? 'bg-slate-800 text-slate-400 animate-pulse' :
            status === 'success' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
            'bg-rose-500/10 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
          }`}>
            {status === 'verifying' && <Loader2 size={32} className="animate-spin" />}
            {status === 'success' && <MailCheck size={32} />}
            {status === 'error' && <ShieldAlert size={32} />}
          </div>
        </div>

        {/* --- TELEMETRY TEXT --- */}
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            {status === 'verifying' ? 'Verifying_Node' : 
             status === 'success' ? 'Verification_Complete' : 
             'Link_Sync_Failure'}
          </h2>
          <div className="h-px w-12 bg-slate-800 mx-auto" />
          <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] leading-relaxed">
            {message}
          </p>
        </div>

        {/* --- ACTION BUTTON --- */}
        {status !== 'verifying' && (
          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className={`w-full group flex items-center justify-between px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all ${
              status === 'success' 
                ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span>{status === 'success' ? 'Enter_The_Matrix' : 'Return_To_Login'}</span>
            <ArrowRight size={16} />
          </motion.button>
        )}

        {/* --- FOOTER SPECS --- */}
        <div className="mt-8 pt-8 border-t border-slate-800/50">
          <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
            Repairum_Security_Module // Protocol_E2E
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;