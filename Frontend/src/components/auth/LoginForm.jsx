import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ArrowRight, ShieldCheck, Activity, Cpu, Globe, Wrench, AlertCircle } from "lucide-react";
import RepairumLogo from "../logo/RepairumLogo";

const LoginForm = ({ onLogin, onFailure, showForgotLink }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      onLogin(res.data.data || res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
      if (onFailure) onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[87vh] w-full flex flex-col mt-20 lg:flex-row bg-white font-sans text-slate-900">

      {/* --- LEFT SIDE: BRANDING & SYSTEM INFO --- */}
      <div className="w-1/3 bg-slate-900 p-20 flex flex-col justify-between relative overflow-hidden">
        {/* Spatial Grid Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[grid-white_40px_40px]" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <RepairumLogo width="48" height="48" variant="light" />
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter leading-[0.9] mb-8">
            Access <br /> <span className="text-slate-600">The Matrix.</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
            Initialize your session to synchronize with global repair nodes.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-indigo-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">System Specs</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase">Uptime</p>
              <p className="text-xs font-mono text-white">99.98%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase">Encryption</p>
              <p className="text-xs font-mono text-white">AES-256</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: AUTHENTICATION FORM --- */}
      <div className="w-2/3 flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              Authentication <span className="text-slate-200">Node</span>
            </h3>
            <p className="text-slate-400 text-xs font-medium">Verify your credentials to establish a secure link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input: Email */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-indigo-500 transition-colors">
                Registry Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="USER_ID@REPAIRIUM.SYS"
                onChange={handleChange}
                className="bg-transparent border-b-2 border-slate-50 py-3 text-sm font-bold text-slate-800 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300 placeholder:text-[10px] placeholder:tracking-[0.2em]"
              />
            </div>

            {/* Input: Password */}
            <div className="flex flex-col gap-2 group relative">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-indigo-500 transition-colors">
                Security Key
              </label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                onChange={handleChange}
                className="bg-transparent border-b-2 border-slate-50 py-2 text-sm font-bold text-slate-800 focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-3 text-slate-300 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-6">
              {showForgotLink && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <AlertCircle size={12} className="text-rose-500" />
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-[9px] font-black text-rose-500 hover:text-slate-900 uppercase tracking-widest transition-colors underline decoration-rose-500/30 underline-offset-4 cursor-pointer"
                  >
                    Forgotten_Password?
                  </button>
                </motion.div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-between px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-indigo-600 active:scale-95 shadow-2xl shadow-slate-200 disabled:opacity-50"
              >
                <span>{loading ? "Establishing..." : "Initialize Link"}</span>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </button>

              <div className="flex justify-between items-center px-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  No Node?
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-[9px] font-black text-indigo-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                  Create_New_Registry
                </button>
              </div>
            </div>
          </form>

          {/* Footer Breadcrumb */}
          <div className="pt-8 flex items-center gap-4 text-slate-200">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-slate-300">
              Network Status: Optimal // E2E_ACTIVE
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;