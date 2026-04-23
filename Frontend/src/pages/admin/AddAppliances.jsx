import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Image as ImageIcon, Box, 
  IndianRupee, Clock, Zap, ShieldCheck, 
  Plus, X, Database, Cpu,
  RefreshCw
} from 'lucide-react';
import applianceService from '../../services/applianceService';

const AddAppliance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'small',
    subCategory: '',
    brand: '',
    model: '',
    description: '',
    basePrice: '',
    serviceCharge: '',
    emergencyCharge: '',
    estimatedServiceTime: '',
    warrantyPeriod: 0,
    isActive: true,
    isFeatured: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // Append image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await applianceService.createAppliance(formData);
      alert("ASSET_NODE_DEPLOYED_SUCCESSFULLY");
      navigate('/admin/appliances');
    } catch (err) {
      console.error("DEPLOYMENT_FAILURE", err);
      alert("REGISTRY_ERROR: Check console for telemetry logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* --- HUD HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">Registry_Protocol // New_Node</p>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
              Deploy <span className="text-slate-200 font-light not-italic">Asset.</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System: Live</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SECTOR: VISUAL & SPECS --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Visual Registry */}
          <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <ImageIcon size={14} className="text-indigo-600" /> Visual_Telemetry
            </h3>
            
            <div className="group relative aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-200">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {setImagePreview(null); setImageFile(null);}}
                    className="absolute top-4 right-4 p-2 bg-slate-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <div className="p-5 bg-white rounded-2xl shadow-sm mb-4">
                    <Plus size={24} className="text-indigo-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Upload_Asset_Image</p>
                  <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>
          </section>

          {/* Technical Specs */}
          <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <Cpu size={14} className="text-indigo-600" /> Specification_Registry
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="Asset_Name" name="name" placeholder="EX: LG SPLIT AC" value={form.name} onChange={handleChange} />
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset_Category</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase italic tracking-widest focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                  <option value="small">Small_Appliance</option>
                  <option value="large">Large_Appliance</option>
                </select>
              </div>
              <InputField label="Brand_ID" name="brand" placeholder="EX: SAMSUNG" value={form.brand} onChange={handleChange} />
              <InputField label="Model_Node" name="model" placeholder="EX: RT34-V2" value={form.model} onChange={handleChange} />
              <InputField label="Sub_Category" name="subCategory" placeholder="EX: REFRIGERATOR" value={form.subCategory} onChange={handleChange} />
              <InputField label="Service_Duration (MIN)" name="estimatedServiceTime" type="number" placeholder="EX: 45" value={form.estimatedServiceTime} onChange={handleChange} />
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset_Description</label>
              <textarea 
                name="description" 
                rows="3"
                value={form.description}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                placeholder="Initialize asset description telemetry..."
              />
            </div>
          </section>
        </div>

        {/* --- RIGHT SECTOR: ECONOMICS & DEPLOY --- */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Economics Node */}
          <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <IndianRupee size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-10 flex items-center gap-2">
                <Database size={14} /> Economics_Node
              </h3>

              <div className="space-y-8">
                <EconomicInput label="Base_Service_Price" name="basePrice" value={form.basePrice} onChange={handleChange} />
                <EconomicInput label="Commission_Charge" name="serviceCharge" value={form.serviceCharge} onChange={handleChange} />
                <EconomicInput label="Emergency_Service_Markup" name="emergencyCharge" value={form.emergencyCharge} onChange={handleChange} />
              </div>

              <div className="mt-12 pt-8 border-t border-slate-800 space-y-6">
                <ToggleSwitch label="Active_In_Fleet" name="isActive" checked={form.isActive} onChange={handleChange} />
                <ToggleSwitch label="Featured_Asset" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Deployment Action */}
          <div className="space-y-4">
             <button 
               type="submit"
               disabled={loading}
               className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
             >
                {loading ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                {loading ? "Initializing_Registry..." : "Confirm_Deployment"}
             </button>
             <button 
               type="button"
               onClick={() => navigate(-1)}
               className="w-full py-5 bg-white border border-slate-100 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
             >
                Abort_Initialization
             </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const InputField = ({ label, name, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-2 group">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <input 
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs font-black uppercase italic tracking-widest focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
      required
    />
  </div>
);

const EconomicInput = ({ label, name, value, onChange }) => (
  <div className="flex justify-between items-center group">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="flex items-center gap-2 border-b-2 border-slate-800 group-focus-within:border-indigo-500 transition-all pb-2">
      <span className="text-slate-600 font-bold">₹</span>
      <input 
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        className="bg-transparent border-none text-xl font-black italic tracking-tighter text-white w-24 text-left outline-none"
        required
      />
    </div>
  </div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <label className="flex justify-between items-center cursor-pointer group">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className="relative">
      <input 
        type="checkbox" 
        name={name}
        checked={checked} 
        onChange={onChange}
        className="sr-only peer" 
      />
      <div className="w-10 h-5 bg-slate-800 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white" />
    </div>
  </label>
);

export default AddAppliance;