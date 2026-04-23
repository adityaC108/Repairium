import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Trash2, Save, X, 
  Settings, Database, IndianRupee, Clock, 
  ShieldCheck, AlertTriangle, Zap, CheckCircle2,
  Trash
} from 'lucide-react';
import applianceService from '../../services/applianceService';

const ApplianceDetail = () => {
  const { applianceId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [appliance, setAppliance] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchApplianceDetails();
  }, [applianceId]);

  const fetchApplianceDetails = async () => {
    try {
      setLoading(true);
      const res = await applianceService.getApplianceById(applianceId);
      const data = res.data.appliance;
      console.log(data)
      setAppliance(data);
      setFormData(data);
    } catch (err) {
      console.error("NODE_FETCH_FAILURE", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      // If handling image updates, you'd use FormData here similarly to AddAppliance
      await applianceService.updateAppliance(applianceId, formData);
      setAppliance(formData);
      setEditing(false);
      alert("REGISTRY_SYNCHRONIZED");
    } catch (err) {
      alert("UPDATE_REJECTED_BY_CORE");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("CRITICAL: Permanent deletion of asset node. Proceed?")) {
      try {
        await applianceService.deleteAppliance(applianceId);
        navigate('/admin/appliances');
      } catch (err) {
        alert("PURGE_FAILED: Asset is currently linked to active bookings.");
      }
    }
  };

  if (loading) return <div className="p-20 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-center">Accessing_Deep_Registry...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* --- HEADER HUD --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">Asset_Node // {appliance._id}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${appliance.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
              {appliance.brand} <span className="text-slate-300 font-light not-italic">{appliance?.name?.split(' ').slice(1).join(' ')}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">
                <Edit3 size={16} /> Edit_Registry
              </button>
              <button onClick={handleDelete} className="p-4 border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <div className="flex gap-2 w-full">
              <button onClick={handleUpdate} disabled={updating} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all">
                <Save size={16} /> {updating ? 'SYNCING...' : 'Save_Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: VISUAL & SPECS --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[3rem] p-4 border border-slate-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden">
              {appliance.images?.[0] ? (
                <img src={appliance.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200"><Settings size={64} /></div>
              )}
            </div>
          </div>

          {/* Quick Telemetry Box */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Database size={14} /> Economics_Node
            </h3>
            <div className="space-y-6">
              <StatItem label="Total_Service_Cost" val={`₹${appliance.totalPrice}`} color="text-white" />
              <StatItem label="Emergency_Rate" val={`₹${appliance.emergencyTotalPrice}`} color="text-rose-400" />
              <StatItem label="Estimated_Time" val={`${appliance.estimatedServiceTime} MIN`} color="text-indigo-400" />
            </div>
          </div>
        </div>

        {/* --- RIGHT: DATA MODULES --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Identity & Configuration */}
          <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
              <ShieldCheck className="text-indigo-600" size={20} />
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">Identity_Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <DetailField label="Brand_ID" value={appliance.brand} isEditing={editing} name="brand" onChange={(e) => setFormData({...formData, brand: e.target.value})} />
              <DetailField label="Model_Node" value={appliance.model} isEditing={editing} name="model" onChange={(e) => setFormData({...formData, model: e.target.value})} />
              <DetailField label="Sub_Category" value={appliance.subCategory} isEditing={editing} name="subCategory" onChange={(e) => setFormData({...formData, subCategory: e.target.value})} />
              <DetailField label="Warranty_Period" value={`${appliance.warrantyPeriod} Months`} isEditing={editing} name="warrantyPeriod" type="number" onChange={(e) => setFormData({...formData, warrantyPeriod: e.target.value})} />
            </div>
            
            <div className="mt-10 pt-10 border-t border-slate-50">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Asset_Description</label>
               {editing ? (
                 <textarea className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" />
               ) : (
                 <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{appliance.description}"</p>
               )}
            </div>
          </section>

          {/* Service Logic (Issues & Solutions) */}
          <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <Zap className="text-amber-500" size={20} />
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">Common_Repair_Logic</h3>
            </div>

            <div className="space-y-4">
              {appliance.commonIssues?.map((issue, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500"><AlertTriangle size={16} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Issue_Detected</p>
                    <p className="text-xs font-black text-slate-900 mb-4 italic">{issue.issue}</p>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={12} />
                      <p className="text-[10px] font-bold uppercase tracking-tighter">Solution: {issue.solution}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Est_Cost</p>
                    <p className="text-xs font-black italic">₹{issue.estimatedCost}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatItem = ({ label, val, color }) => (
  <div className="flex justify-between items-center">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-black italic ${color}`}>{val}</span>
  </div>
);

const DetailField = ({ label, value, isEditing, name, onChange, type="text" }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    {isEditing ? (
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        className="w-full p-3 bg-slate-50 rounded-xl border-none text-xs font-black uppercase italic tracking-widest focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
      />
    ) : (
      <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{value || "NULL_VALUE"}</p>
    )}
  </div>
);

export default ApplianceDetail;