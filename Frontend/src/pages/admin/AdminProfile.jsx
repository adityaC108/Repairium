import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Camera, 
  Save, X, CheckCircle2, Activity, Clock, 
  Lock, Key, Fingerprint,
  Calendar
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProfile();
      setAdmin(res.data.admin);
      setFormData({
        firstName: res.data.admin.firstName,
        lastName: res.data.admin.lastName,
        phone: res.data.admin.phone
      });
    } catch (err) {
      console.error("ADMIN_SYNC_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    try {
      setUploading(true);
      const res = await adminService.updateAdminAvatar(data);
      setAdmin({ ...admin, avatar: res.data.avatar });
      alert("AVATAR_RECONCILED_SUCCESSFULLY");
    } catch (err) {
      alert("UPLOAD_PROTOCOL_FAILED");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminService.updateProfile(formData);
      setEditing(false);
      fetchProfile(); // Refresh registry
    } catch (err) {
      alert("REGISTRY_UPDATE_DENIED");
      console.error("ADMIN_UPDATE_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !admin) return <div className="p-12 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing_Admin_Telemetry...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* --- HUD HEADER --- */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">System_Admin // Node_Controller</p>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900 leading-none mt-2">
            Account <span className="text-slate-300 font-light not-italic">Registry.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection: Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SECTOR: AVATAR & STATS --- */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            {/* Visual Decoration */}
            <Fingerprint className="absolute -right-4 -bottom-4 text-slate-800 w-32 h-32 opacity-50" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="group relative w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-800 shadow-2xl overflow-hidden mb-6">
                {admin.avatar ? (
                  <img src={admin.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black">
                    {admin.firstName[0]}{admin.lastName[0]}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Update_Node</span>
                  <input type="file" hidden onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
              
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{admin.fullName}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{admin.role}</p>
            </div>

            <div className="mt-10 space-y-4 pt-8 border-t border-slate-800 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Security_Level</span>
                <span className="text-indigo-400 flex items-center gap-2"><Shield size={12}/> Verified_Admin</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Node_ID</span>
                <span className="font-mono">#{admin._id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4 flex items-center gap-2">
                <Activity size={14} className="text-indigo-600"/> Session_Telemetry
             </h4>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={16}/></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Last_Login</p>
                      <p className="text-xs font-bold text-slate-700">{new Date(admin.lastLogin).toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Calendar size={16}/></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Registry_Created</p>
                      <p className="text-xs font-bold text-slate-700">{new Date(admin.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* --- RIGHT SECTOR: REGISTRY UPDATION --- */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
                <User size={18} className="text-indigo-600" /> Admin_Identity_Registry
              </h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all">
                  Edit_Registry
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField 
                label="First_Name" 
                value={editing ? formData.firstName : admin.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                disabled={!editing}
              />
              <InputField 
                label="Last_Name" 
                value={editing ? formData.lastName : admin.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={!editing}
              />
              <InputField 
                label="Email_Address" 
                value={admin.email} 
                disabled={true} 
                sub="Node_Email cannot be modified in basic registry."
              />
              <InputField 
                label="Contact_Phone" 
                value={editing ? formData.phone : admin.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!editing}
              />

              {editing && (
                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                    <Save size={18} /> Reconcile_Registry_Changes
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Permissions Registry */}
          <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8 flex items-center gap-3">
                <Lock size={18} className="text-rose-500" /> Authorized_Permissions
             </h3>
             <div className="flex flex-wrap gap-3">
                {admin.permissions.map(perm => (
                  <span key={perm} className="px-4 py-2 bg-slate-50 border border-slate-100 text-[9px] font-black uppercase text-slate-500 tracking-widest rounded-xl">
                    ● {perm.replace('_', ' ')}
                  </span>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const InputField = ({ label, value, onChange, disabled, sub }) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
      {label}
      {disabled && <Key size={10} className="text-slate-200" />}
    </label>
    <input 
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full p-4 text-xs font-black uppercase italic tracking-widest rounded-2xl border transition-all outline-none ${
        disabled 
          ? 'bg-slate-50 border-slate-50 text-slate-400 cursor-not-allowed' 
          : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'
      }`}
    />
    {sub && <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter italic">{sub}</p>}
  </div>
);

export default AdminProfile;