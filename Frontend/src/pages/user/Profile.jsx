import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, MapPin, Phone, ShieldCheck, 
  Camera, Save, ArrowRight, Navigation, 
  Activity, Fingerprint, Globe, Map,
  Mail, CheckCircle, AlertCircle, Clock
} from "lucide-react";
import API from "../../services/api";
import { getCurrentLocation, getReverseGeocode } from "../../utils/locationHelper";
import RepairumLogo from "../../components/logo/RepairumLogo";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal"); // personal, location
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",  
    pincode: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      console.log(res)
      const u = res.data.data.user;
      setForm({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        phone: u.phone || "",
        email: u.email || "",
        street: u.address?.street || "",
        city: u.address?.city || "",
        state: u.address?.state || "",
        pincode: u.address?.pincode || "",
        isVerified: u.isVerified,
      });
    } catch (err) {
      console.error("IDENTITY_SYNC_ERROR:", err);
    }
  };

  const handleAutoDetect = async () => {
    setIsLocating(true);
    setStatus(null);
    try {
      const coords = await getCurrentLocation();
      const addressDetails = await getReverseGeocode(coords.lat, coords.lng);
      setForm((prev) => ({
        ...prev,
        city: addressDetails.city,
        state: addressDetails.state,
        pincode: addressDetails.pincode,
      }));
      setStatus({ type: "success", message: "Spatial Matrix Synced" });
    } catch (err) {
      setStatus({ type: "error", message: "GPS Protocol Failed" });
    } finally {
      setIsLocating(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          coordinates: { type: "Point", coordinates: [0, 0] },
        },
      };
      const res = await API.put("/users/profile", payload);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      setStatus({ type: "success", message: "Identity Committed" });
    } catch (err) {
      setStatus({ type: "error", message: "Sync Failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 max-w-6xl mx-auto p-6 animate-in fade-in duration-700">
      
      {/* --- HUD HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <RepairumLogo width="32" height="32" className="opacity-80" />
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase">
              Identity <span className="text-slate-200 font-light">Node</span>
            </h1>
            <div className="p-1 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-100">
              <Fingerprint size={16} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Auth Protocol</span>
            <div className="h-px w-12 bg-slate-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Standard User Access
            </span>
          </div>
        </div>

        <div className="min-h-[48px]">
          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100 ${
                  status.type === "success" ? "bg-white border-emerald-100 text-emerald-600" : "bg-white border-rose-100 text-rose-600"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* --- NAVIGATOR --- */}
      <nav className="flex items-center gap-2 mb-16 bg-slate-50/50 p-1.5 rounded-[2rem] w-fit border border-slate-100 backdrop-blur-sm mx-auto">
        <TabBtn active={activeTab === "personal"} onClick={() => setActiveTab("personal")} icon={<User size={14} />} label="Parameters" />
        <TabBtn active={activeTab === "location"} onClick={() => setActiveTab("location")} icon={<MapPin size={14} />} label="Spatial Matrix" />
      </nav>

      {/* --- CONTENT ENGINE --- */}
      <main className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {/* PARAMETERS TAB */}
            {activeTab === "personal" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-4 border border-dashed border-slate-100 rounded-[3rem] group-hover:rotate-90 transition-transform duration-1000" />
                    <div className="relative w-48 h-48 bg-slate-900 rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-2xl shadow-slate-200 flex items-center justify-center">
                      <User size={60} className="text-white opacity-20" />
                      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-indigo-600/40 to-transparent pointer-events-none" />
                    </div>
                  </div>
                  <div className="text-center space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                        form.isVerified 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {form.isVerified ? (
                          <>
                            <CheckCircle size={12} />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            <span>Unverified</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Subject</p>
                      <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
                        {form.firstName} <br /> {form.lastName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-sm font-mono">{form.email || 'Not Set'}</span>
                    </div>
                    
                  </div>
                </div>

                <form onSubmit={handleUpdate} className="lg:col-span-8 space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <GeographicInput label="Legal Given Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    <GeographicInput label="Legal Surname" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    <div className="md:col-span-2">
                      <GeographicInput label="Auth Communication (Phone)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <SubmitBtn loading={loading} label="Commit Identity" />
                </form>
              </div>
            )}

            {/* SPATIAL MATRIX TAB */}
            {activeTab === "location" && (
              <div className="max-w-5xl mx-auto space-y-20">
                <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                  {/* GPS Status Console (Matches Technician Style) */}
                  <div className="flex items-center gap-6 bg-white p-2 pl-6 rounded-full border border-slate-100 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">GPS Signal</span>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`w-1 h-3 rounded-full ${form.city ? "bg-indigo-500" : "bg-slate-100"}`} />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleAutoDetect}
                      disabled={isLocating}
                      className={`h-12 px-8 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${
                        isLocating ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-200"
                      }`}
                    >
                      {isLocating ? "Locating..." : "Initialize GPS Sync"}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-900 mb-4">
                        <Map size={20} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Deployment Data</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                        Current geographic coordinates are required for accurate technician dispatching.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-12 bg-white p-10 rounded-[3rem] border border-slate-100/50">
                    <GeographicInput label="Street Registry" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <GeographicInput label="Target City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                      <div className="grid grid-cols-2 gap-8">
                        <GeographicInput label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                        <GeographicInput label="Postal Code" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                      </div>
                    </div>
                    <SubmitBtn loading={loading} label="Secure Location Data" />
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Helper Components ---

const TabBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${active ? "bg-white shadow-sm text-slate-900 border border-slate-100" : "text-slate-300 hover:text-slate-500"}`}>
    {icon} {label}
  </button>
);

const GeographicInput = ({ label, ...props }) => (
  <div className="flex flex-col gap-3 group">
    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-focus-within:text-slate-900 transition-colors">
      {label}
    </label>
    <input {...props} className="bg-transparent border-b border-slate-100 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-100" />
  </div>
);

const SubmitBtn = ({ loading, label }) => (
  <button className="flex items-center gap-6 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50">
    {loading ? "Processing..." : label}
    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
      <ArrowRight size={16} />
    </div>
  </button>
);

export default ProfilePage;