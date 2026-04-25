import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Save, Loader2, Eye, EyeOff } from "lucide-react";
import API from "../../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        token: searchParams.get("token"),
        role: searchParams.get("role"),
        newPassword
      });
      alert("CREDENTIALS_RECONCILED: Redirecting to login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "RECONCILIATION_FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
       <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10">Set <span className="text-indigo-500">New_Key.</span></h2>
          
          <form onSubmit={handleReset} className="space-y-10">
             <div className="flex flex-col gap-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New_Security_Password</label>
                <input 
                  type={showPass ? "text" : "password"} required value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-slate-800 py-4 text-white text-lg font-bold outline-none focus:border-indigo-500 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-0 bottom-4 text-slate-500">
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
             </div>

             <button disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-emerald-500 shadow-2xl shadow-emerald-900/20 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {loading ? "Re-Encrypting..." : "Update_Security_Registry"}
             </button>
          </form>
       </div>
    </div>
  );
};

export default ResetPassword;