import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ArrowRight, MapPin, UserPlus, Crosshair, Loader2, Database, Award } from "lucide-react";
import RepairumLogo from "../logo/RepairumLogo";
import { getCurrentLocation, getReverseGeocode } from "../../utils/locationHelper"; // Ensure this returns { address, coords: [lat, lng] }

const RegisterForm = ({ role, onRegister }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    skills: "", 
    experience: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      coordinates: [0, 0], // [longitude, latitude]
    },
  });

  const isLocationRequired = role === "user" || role === "technician";
  const isTechnician = role === "technician";

  // --- AUTO-FETCH LOGIC ---
  const handleAutoLocation = async () => {
    try {
      setLocating(true);
      setError("");

      const coords = await getCurrentLocation();
      const location = await getReverseGeocode(coords.lat, coords.lng);

      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          street: location?.street || prev.address.street,
          city: location?.city || prev.address.city,
          state: location?.state || prev.address.state,
          pincode: location?.pincode || prev.address.pincode,
          coordinates: [coords.lng, coords.lat],
        },
      }));
    } catch (err) {
      setError("GEOLOCATION_SYNC_FAILED: Satellite link interrupted or permissions denied.");
    } finally {
      setLocating(false);
    }
  };

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setError("");
    setForm({
      ...form,
      address: { ...form.address, [e.target.name]: e.target.value },
    });
  };

  const getEndpoint = () => {
    if (role === "admin") return "/auth/register/admin";
    if (role === "technician") return "/auth/register/technician";
    return "/auth/register/user";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isTechnician) {
        form.skills = form.skills.split(",").map(s => s.trim());
      }
      const res = await API.post(getEndpoint(), form);
      onRegister(res.data.data);
    } catch (err) {
      setError(err.response?.data?.errors?.map(e => e.message).join(", ") || err.response?.data.message || "REGISTRY_FAILURE: Identity synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans text-slate-900">

      {/* --- LEFT: BRANDING & TELEMETRY --- */}
      <div className="w-full lg:w-1/3 bg-slate-900 p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden lg:fixed lg:h-screen">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[grid-white_40px_40px]" />

        <div className="relative z-10">
          <RepairumLogo width="48" height="48" variant="light" />
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-8 mb-4">Registry_Protocol // {role}</p>
          <h2 className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter leading-[0.9] mb-8">
            Deploy <br /> <span className="text-slate-600">New Node.</span>
          </h2>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-emerald-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Data Sync</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase">Geo_Link</p>
              <p className={`text-xs font-mono ${form.address.coordinates[0] !== 0 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
                {form.address.coordinates[0] !== 0 ? 'LOCKED' : 'OFFLINE'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase">Encryption</p>
              <p className="text-xs font-mono text-white">SHA-256</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT: DATA ENTRY TERMINAL --- */}
      <div className="w-full lg:w-2/3 flex items-center justify-center bg-slate-50 ml-auto p-8 lg:p-20">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl space-y-12 py-12">

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Registry <span className="text-slate-200">Terminal</span></h3>
            <p className="text-slate-400 text-xs font-medium">Verify node details for {role} initialization.</p>
          </div>

          {error && <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-600 text-[10px] font-black uppercase tracking-widest">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Operator Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <CustomInput label="First_Name" name="firstName" value={form.firstName} onChange={handleChange} />
              <CustomInput label="Last_Name" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <CustomInput label="Registry_Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <CustomInput label="Comms_Phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div className="flex flex-col gap-2 group relative">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Security_Key</label>
              <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" onChange={handleChange} className="bg-transparent border-b-2 border-slate-100 py-3 text-sm font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-slate-300 hover:text-indigo-600">
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {/* --- TECHNICIAN SPECIALIZED MODULE --- */}
            {isTechnician && (
              <div className="space-y-10 pt-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4">
                  <Award size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Operational_Experience</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <CustomInput
                    label="Skills_Registry"
                    name="skills"
                    placeholder="EX: AC, FRIDGE, WIRING"
                    value={form.skills}
                    onChange={handleChange}
                    sub="Separate skills with commas"
                  />
                  <CustomInput
                    label="Years_Exp"
                    name="experience"
                    type="number"
                    placeholder="0"
                    value={form.experience}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Geographic Sector */}
            {isLocationRequired && (
              <div className="space-y-10 pt-4 animate-in slide-in-from-top-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <MapPin size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Geographic_Node_Assignment</span>
                  </div>
                  {/* AUTO-FETCH TRIGGER */}
                  <button
                    type="button"
                    onClick={handleAutoLocation}
                    disabled={locating}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    {locating ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                    {locating ? "Establishing_Link..." : "Locate_Node"}
                  </button>
                </div>

                <CustomInput label="Street_Address" name="street" value={form.address.street} onChange={handleAddressChange} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <CustomInput label="City" name="city" value={form.address.city} onChange={handleAddressChange} />
                  <CustomInput label="State" name="state" value={form.address.state} onChange={handleAddressChange} />
                  <CustomInput label="Pincode" name="pincode" value={form.address.pincode} onChange={handleAddressChange} />
                </div>

                {/* Coordinates HUD */}
                <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center shadow-lg shadow-slate-200">
                  <div className="flex items-center gap-3">
                    <Database size={14} className="text-indigo-400" />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">GeoJSON_Telemetry</p>
                  </div>
                  <p className="text-[9px] font-mono font-black text-emerald-400">
                    LNG: {form.address.coordinates[0]} // LAT: {form.address.coordinates[1]}
                  </p>
                </div>
              </div>
            )}

            {/* Submission */}
            <div className="flex flex-col gap-6 pt-10">
              <button type="submit" disabled={loading} className="group flex items-center justify-between px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-emerald-600 active:scale-95 shadow-2xl disabled:opacity-50">
                <span>{loading ? "Allocating..." : "Initialize Registry"}</span>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><UserPlus size={16} /></div>
              </button>
              <button type="button" onClick={() => navigate("/login")} className="text-center text-[9px] font-black text-slate-300 hover:text-indigo-600 uppercase tracking-[0.2em]">Already_Linked?_Access_Matrix</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const CustomInput = ({ label, name, type = "text", value, onChange }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-focus-within:text-indigo-500 transition-colors">{label}</label>
    <input name={name} type={type} required value={value} onChange={onChange} className="bg-transparent border-b-2 border-slate-100 py-3 text-sm font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
  </div>
);

export default RegisterForm;