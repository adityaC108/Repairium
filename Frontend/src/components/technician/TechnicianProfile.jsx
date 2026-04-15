import React, { useState } from 'react';
import technicianServices from '../../services/technicianService';
import {
  User,
  MapPin,
  ShieldCheck,
  Building2,
  Camera,
  Save,
  Loader2,
  Plus,
  Eye,
  Upload,
  FileText,
  ArrowRight,
  Crosshair,
  CheckCircle,
  XCircle,
  FileQuestion,
  Clock
} from 'lucide-react';
import { getCurrentLocation, getReverseGeocode } from '../../utils/locationHelper';
import { motion, AnimatePresence } from 'framer-motion';

const TechnicianProfile = ({ initialData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('personal'); // personal, location, documents, bank
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // States
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    skills: initialData?.skills?.join(', ') || '',
  });

  const [bankData, setBankData] = useState({
    accountHolder: initialData?.bankDetails?.accountHolder || '',
    accountNumber: initialData?.bankDetails?.accountNumber || '',
    bankName: initialData?.bankDetails?.bankName || '',
    ifscCode: initialData?.bankDetails?.ifscCode || '',
  });

  const [locationData, setLocationData] = useState({
    city: initialData?.serviceAreas?.[0]?.city || '',
    state: initialData?.serviceAreas?.[0]?.state || '',
    pincode: initialData?.serviceAreas?.[0]?.pincode || '',
    serviceRadius: initialData?.serviceAreas?.[0]?.serviceRadius || 10,
  });

  const [liveCoords, setLiveCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // --- Handlers ---

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    setLoading(true);

    try {
      if (type === 'avatar') {
        formData.append('avatar', file); // Use 'avatar' field name for Multer
        await technicianServices.updateAvatar(formData);
        setStatus({ type: 'success', message: 'Profile picture updated!' });
      } else {
        formData.append('document', file);
        formData.append('documentType', type);
        await technicianServices.uploadDocument(formData);
        setStatus({ type: 'success', message: 'Document uploaded!' });
      }

      onUpdate(); // Re-fetch data to show the new image
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await technicianServices.updateBankDetails(bankData);
      setStatus({ type: 'success', message: 'Bank details updated!' });
      onUpdate();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- The Redesigned TabBtn Component ---
  const TabBtn = ({ active, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`
      flex items-center gap-2.5 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95
      ${active
          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
        }
    `}
    >
      <span className={`${active ? "text-indigo-600" : "text-slate-300"} transition-colors`}>
        {icon}
      </span>
      {label}
    </button>
  );

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      const res = await technicianServices.updateProfile(payload);
      if (res.success) {
        setStatus({ type: 'success', message: 'Profile updated!' });
        onUpdate();
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = async () => {
    setIsLocating(true);
    setStatus(null);

    try {
      // 1. Get Coordinates
      const coords = await getCurrentLocation();
      setLiveCoords(coords);

      // 2. Get Full Address using the new utility
      const addressDetails = await getReverseGeocode(coords.lat, coords.lng);

      // 3. Update the inputs automatically
      setLocationData({
        ...locationData,
        city: addressDetails.city,
        state: addressDetails.state,
        pincode: addressDetails.pincode
      });

      setStatus({ type: 'success', message: 'Location & Address detected!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLocating(false);
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const lat = liveCoords?.lat || initialData?.currentLocation?.coordinates[1] || 0;
      const lng = liveCoords?.lng || initialData?.currentLocation?.coordinates[0] || 0;

      const payload = {
        coordinates: { lat, lng },
        address: { ...locationData, serviceRadius: Number(locationData.serviceRadius) }
      };

      await technicianServices.updateLocation(payload);
      setStatus({ type: 'success', message: 'Service area updated!' });
      setLiveCoords(null);
      onUpdate();
    } catch (err) {
      setStatus({ type: 'error', message: 'Location update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-700">

      {/* --- HUD HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">
              Profile <span className="text-slate-200 font-light">Settings</span>
            </h1>
            {initialData?.isVerified && (
              <div className="p-1 bg-green-500 text-white rounded-full">
                <ShieldCheck size={16} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Node Status</span>
            <div className="h-px w-12 bg-slate-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {initialData?.verificationStatus?.replace('_', ' ') || 'Initializing'}
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
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100 ${status.type === 'success' ? 'bg-white border-emerald-100 text-emerald-600' : 'bg-white border-rose-100 text-rose-600'
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* --- NAVIGATOR --- */}
      <nav className="flex items-center gap-2 mb-20 bg-slate-50/50 p-1.5 rounded-[2rem] w-fit border border-slate-100 backdrop-blur-sm mx-auto">
        <TabBtn
          active={activeTab === 'personal'}
          onClick={() => setActiveTab('personal')}
          icon={<User size={14} />}
          label="Identity"
        />
        <TabBtn
          active={activeTab === 'location'}
          onClick={() => setActiveTab('location')}
          icon={<MapPin size={14} />}
          label="Location"
        />
        <TabBtn
          active={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
          icon={<ShieldCheck size={14} />}
          label="Assets"
        />
        <TabBtn
          active={activeTab === 'bank'}
          onClick={() => setActiveTab('bank')}
          icon={<Building2 size={14} />}
          label="Treasury"
        />
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
            {/* PERSONAL TAB */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-8">
                  <div className="relative group">
                    <div className="absolute -inset-4 border border-dashed border-slate-100 rounded-[3rem] group-hover:rotate-90 transition-transform duration-1000" />
                    <div className="relative w-48 h-48 bg-slate-50 rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-2xl shadow-slate-200">
                      {initialData?.avatar ? <img src={initialData.avatar} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-200 m-auto mt-14" />}
                      <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                        <Camera size={20} className="text-white mb-2" />
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'avatar')} />
                      </label>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">Signature</p>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                      {formData.firstName} <br /> {formData.lastName}
                    </h3>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="lg:col-span-8 space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <GeographicInput label="Legal First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    <GeographicInput label="Legal Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    <div className="md:col-span-2">
                      <GeographicInput label="Encrypted Communication" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Bio & Skills</label>
                    <textarea
                      className="w-full bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:border-slate-900 transition-all min-h-[160px] resize-none"
                      value={formData.skills}
                      onChange={e => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="Describe your capabilities..."
                    />
                  </div>
                  <SubmitBtn loading={loading} label="Commit Profile" />
                </form>
              </div>
            )}

            {/* Location TAB */}
            {activeTab === 'location' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto">

                {/* 1. The Dynamic Header Section */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-8">

                  {/* GPS Status Console */}
                  <div className="flex items-center gap-6 bg-white p-2 pl-6 rounded-full border border-slate-100 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Signal Strength</span>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`w-1 h-3 rounded-full ${liveCoords ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleAutoDetect}
                      disabled={isLocating}
                      className={`h-12 px-8 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${liveCoords
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                          : 'bg-slate-900 text-white hover:bg-gray-600 shadow-xl shadow-slate-200 cursor-pointer'
                        }`}
                    >
                      {isLocating ? 'Locating...' : liveCoords ? 'GPS Active' : 'Initialize GPS'}
                    </button>
                  </div>
                </div>

                {/* 2. The Main Interaction Grid */}
                <form onSubmit={handleLocationSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                  {/* Left: Range & Radius (The Core Value) */}
                  <div className="lg:col-span-7 space-y-12">
                    <div className="relative pt-10">
                      <div className="flex justify-between items-end mb-8">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Coverage Radius</label>
                        <div className="text-right">
                          <h2 className="text-7xl font-black text-slate-900 tracking-tighter">{locationData.serviceRadius}<span className="text-lg text-indigo-500 ml-2 italic">KM</span></h2>
                        </div>
                      </div>

                      {/* Custom Styled Range */}
                      <div className="relative h-20 flex items-center">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
                        <input
                          type="range" min="10" max="50" step="5"
                          className="absolute top-1/2 left-0 w-full appearance-none bg-transparent cursor-pointer -translate-y-1/2 accent-slate-900 z-10"
                          value={locationData.serviceRadius}
                          onChange={e => setLocationData({ ...locationData, serviceRadius: e.target.value })}
                        />
                        {/* Visual Markers */}
                        <div className="w-full flex justify-between px-1 text-[10px] font-bold text-slate-400 mt-12">
                          <span>LOCAL</span>
                          <span>REGIONAL</span>
                          <span>METRO</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button - Floating Style */}
                    <div className="pt-8 flex justify-end">
                      <button
                        disabled={loading}
                        className="group relative flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest overflow-hidden transition-all hover:bg-gray-600 active:scale-95 disabled:opacity-50"
                      >
                        <span className="relative z-10">{loading ? 'Processing...' : 'Sync All Changes'}</span>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <ArrowRight size={16} />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Right: Geographical Data (Minimalist Inputs) */}
                  <div className="lg:col-span-5 space-y-8 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100/50">
                    <div className="space-y-6">
                      <GeographicInput label="Target City" value={locationData.city} onChange={e => setLocationData({ ...locationData, city: e.target.value })} />
                      <div className="grid grid-cols-2 gap-8">
                        <GeographicInput label="State" value={locationData.state} onChange={e => setLocationData({ ...locationData, state: e.target.value })} />
                        <GeographicInput label="Postal Code" value={locationData.pincode} onChange={e => setLocationData({ ...locationData, pincode: e.target.value })} />
                      </div>
                    </div>

                    {/* GPS Meta-data Info */}
                    {liveCoords && (
                      <div className="mt-10 pt-8 border-t border-slate-200/60">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Metadata</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
                          {liveCoords.lat.toFixed(6)} N / {liveCoords.lng.toFixed(6)} E
                        </p>
                      </div>
                    )}
                  </div>

                </form>
              </div>
            )}



            {/* ASSETS TAB (Documents) */}
            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DocUpload label="Aadhar Identity" status={initialData?.documents?.aadharCard?.status} url={initialData?.documents?.aadharCard?.url} onChange={(e) => handleFileUpload(e, 'aadharCard')} />
                <DocUpload label="Taxation PAN" status={initialData?.documents?.panCard?.status} url={initialData?.documents?.panCard?.url} onChange={(e) => handleFileUpload(e, 'panCard')} />
                <DocUpload label="Residential Proof" status={initialData?.documents?.addressProof?.status} url={initialData?.documents?.addressProof?.url} onChange={(e) => handleFileUpload(e, 'addressProof')} />
                <DocUpload label="Police Verification" status={initialData?.documents?.policeVerification?.status} url={initialData?.documents?.policeVerification?.url} onChange={(e) => handleFileUpload(e, 'policeVerification')} />
              </div>
            )}

            {/* TREASURY TAB (Bank) */}
            {activeTab === 'bank' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-4">
                  <div className="relative aspect-[1.6/1] w-full bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden shadow-2xl shadow-slate-200 group">
                    {/* Decorative background elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-colors" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

                    <div className="relative h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <Building2 size={28} className="text-indigo-400" />
                        <div className="w-10 h-8 bg-amber-400/20 border border-amber-400/30 rounded-md" /> {/* Simulating Card Chip */}
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Account Number</p>
                        <p className="text-lg font-black tracking-widest">
                          {bankData.accountNumber
                            ? `•••• •••• ${bankData.accountNumber.slice(-4)}`
                            : '•••• •••• ••••'
                          }
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Holder Name</p>
                          <p className="text-xs font-black uppercase truncate max-w-[120px]">
                            {bankData.accountHolder || 'Not Set'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">IFSC</p>
                          <p className="text-xs font-black uppercase">{bankData.ifscCode || '----'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                    <ShieldCheck size={20} className="text-slate-400 shrink-0" />
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Your banking data is encrypted. Updates take <span className="text-slate-900 font-bold">24-48 hours</span> to verify with our payment partner.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleBankSubmit} className="lg:col-span-8 space-y-12">
                  <GeographicInput label="Beneficiary Name" value={bankData.accountHolder} onChange={e => setBankData({ ...bankData, accountHolder: e.target.value })} />
                  <div className="grid grid-cols-2 gap-12">
                    <GeographicInput label="Account Number" value={bankData.accountNumber} onChange={e => setBankData({ ...bankData, accountNumber: e.target.value })} />
                    <GeographicInput label="IFSC Routing Code" value={bankData.ifscCode} onChange={e => setBankData({ ...bankData, ifscCode: e.target.value })} />
                  </div>
                  <GeographicInput label="Financial Institution" value={bankData.bankName} onChange={e => setBankData({ ...bankData, bankName: e.target.value })} />
                  <SubmitBtn loading={loading} label="Secure Financials" />
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
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-300 hover:text-slate-500'
    }`}>
    {icon} {label}
  </button>
);

// --- Elegant Geographic Input -

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
    {loading ? 'Processing...' : label}
    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
      <ArrowRight size={16} />
    </div>
  </button>
);

const DocUpload = ({ label, status, url, onChange }) => {
  const isPDF = url?.toLowerCase().endsWith('.pdf');
  const active = status === 'approved';

  return (
    <div className="group relative bg-slate-50/30 rounded-[3rem] p-10 border border-slate-100 hover:bg-white transition-all hover:shadow-2xl hover:shadow-slate-100">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Asset</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">{label}</h4>
        </div>
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
          {status?.replace('_', ' ') || 'Missing'}
        </div>
      </div>

      <div className="relative aspect-video rounded-[2rem] bg-white border border-slate-100 overflow-hidden shadow-inner group">
        {url ? (
          <>
            {isPDF ? <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50/30"><FileText size={40} className="text-rose-500" /></div> : <img src={url} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
              <button onClick={() => window.open(url, '_blank')} className="p-4 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform"><Eye size={20} /></button>
              <label className="p-4 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform cursor-pointer">
                <Upload size={20} /><input type="file" className="hidden" onChange={onChange} />
              </label>
            </div>
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <Plus size={32} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
            <input type="file" className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
    </div>
  );
};

export default TechnicianProfile;