import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, HardHat, CheckCircle2, RefreshCw, ShieldAlert, 
  Ban, ShieldCheck, FileText, ChevronRight, UserX
} from 'lucide-react';
import adminService from '../../services/adminService';

const Technicians = () => {
  const navigate = useNavigate();
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [auditModal, setAuditModal] = useState({ show: false, techId: null, actionType: null });
  const [reason, setReason] = useState("");

  

  const fetchTechs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllTechnicians({ search });
      setTechs(res.data.data);
    } catch (err) {
      console.error("FLEET_SYNC_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const openAuditModal = (e, techId, actionType) => {
    e.stopPropagation(); // Prevents row navigation when clicking buttons
    setAuditModal({ show: true, techId, actionType });
  };

  const handleAction = async () => {
    if (!reason.trim()) return alert("PROMPT: Reason_Required_For_Audit_Log");
    try {
      if (auditModal.actionType === 'VERIFY') {
        await adminService.verifyTechnician(auditModal.techId, { verificationStatus: 'verified', reason });
      } else if (auditModal.actionType === 'REJECT') {
        await adminService.verifyTechnician(auditModal.techId, { verificationStatus: 'rejected', rejectionReason: reason });
      } else if (auditModal.actionType === 'TOGGLE') {
        const tech = techs.find(t => t._id === auditModal.techId);
        await adminService.updateTechnicianStatus(auditModal.techId, { isActive: !tech.isActive, reason });
      }
      setAuditModal({ show: false, techId: null, actionType: null });
      setReason("");
      fetchTechs();
    } catch (err) {
      console.error("PROTOCOL_SYNC_FAILED");
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* --- HUD HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            Service <span className="text-slate-300 font-light not-italic">Fleet.</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active_Nodes: {techs.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="SEARCH_BY_CALLSIGN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTechs()}
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-600/5 transition-all outline-none shadow-sm"
            />
          </div>
          <button onClick={fetchTechs} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- FLEET DATA TERMINAL --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Technician_Node</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational_Status</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit_State</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">System_Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {techs.map((tech) => (
                <tr 
                  key={tech._id} 
                  onClick={() => navigate(`/admin/technicians/${tech._id}`)}
                  className="group hover:bg-slate-50/40 transition-colors cursor-pointer"
                >
                  {/* Identity */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[10px] uppercase shadow-lg shrink-0">
                        {tech.avatar ? (
                          <img src={tech.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span>{tech.firstName[0]}{tech.lastName[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase italic leading-tight">{tech.firstName} {tech.lastName}</p>
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">NODE_REF: {tech._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>

                  {/* Operational Status */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${tech.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{tech.isOnline ? 'Active' : 'Standby'}</span>
                    </div>
                  </td>

                  {/* Audit State */}
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                      tech.verificationStatus === 'verified' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                      tech.verificationStatus === 'pending' ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-rose-50 border-rose-100 text-rose-600"
                    }`}>
                      {tech.verificationStatus === 'verified' ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                      {tech.verificationStatus}
                    </span>
                  </td>

                  {/* Control HUB */}
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2">
                      {tech.verificationStatus !== 'verified' && (
                        <button 
                          onClick={(e) => openAuditModal(e, tech._id, 'VERIFY')}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all"
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={(e) => openAuditModal(e, tech._id, 'TOGGLE')}
                        className={`p-2 rounded-lg transition-all ${tech.isActive ? "text-slate-300 hover:text-rose-600" : "text-emerald-500 hover:bg-emerald-50"}`}
                      >
                        {tech.isActive ? <UserX size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <div className="p-2 text-slate-200 group-hover:text-indigo-600 transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- AUDIT MODAL --- */}
      {auditModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl space-y-6 border border-slate-100">
            <h3 className="text-lg font-black tracking-tighter italic uppercase text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              Audit <span className="text-slate-300 font-light not-italic">Log.</span>
            </h3>
            <textarea 
              value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="REASON_FOR_REGISTRY_UPDATE..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[10px] font-bold uppercase tracking-widest min-h-[100px] outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setAuditModal({show:false})} className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-lg">Abort</button>
              <button onClick={handleAction} className="flex-1 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technicians;