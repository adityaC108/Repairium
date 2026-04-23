import React, { useState, useEffect } from 'react';
import {
  Search, UserX, CheckCircle2, Mail, Calendar,
  ShieldCheck, RefreshCw, XCircle, Phone, Activity,
  MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const navigate = useNavigate(); // 🔥 Step 2: Initialize Hook
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reasonModal, setReasonModal] = useState({ show: false, userId: null, currentStatus: null });
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers({ search });
      setUsers(res.data.data);
    } catch (err) {
      console.error("USER_REGISTRY_SYNC_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusInitiation = (userId, currentStatus) => {
    e.stopPropagation(); 
    setReasonModal({ show: true, userId, currentStatus });
  };

  const toggleStatus = async () => {
    if (!reason.trim()) return alert("PROMPT: Reason_Required_For_Audit");

    try {
      setLoading(true);
      await adminService.updateUserStatus(reasonModal.userId, {
        isActive: !reasonModal.currentStatus,
        reason: reason // 🔥 Now passing the admin's justification
      });

      // Reset Terminal State
      setReasonModal({ show: false, userId: null, currentStatus: null });
      setReason("");
      fetchUsers();
    } catch (err) {
      console.error("SYNC_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* --- HUD HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            Client <span className="text-slate-300 font-light not-italic">Registry.</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active_Nodes: {users.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="SEARCH_REGISTRY..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="w-full bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-600/5 transition-all outline-none shadow-sm"
            />
          </div>
          <button onClick={fetchUsers} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all hover:shadow-md active:scale-95">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- MAIN DATA TERMINAL --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity_Node</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry_Date</th>
                <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user._id} 
                onClick={() => navigate(`/admin/users/${user._id}`)} 
                className="group hover:bg-slate-50/40 transition-colors cursor-pointer"
                >
                  {/* Identity */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[10px] uppercase shadow-lg shadow-slate-200">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase italic leading-tight">{user.firstName} {user.lastName}</p>
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5">ID_{user._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email & Auth */}
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail size={10} className="text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {user.isVerified ? <ShieldCheck size={10} className="text-emerald-500" /> : <XCircle size={10} className="text-rose-400" />}
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{user.isVerified ? 'Auth_Valid' : 'Pending_Auth'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Phone size={10} className="text-slate-300" />
                      <span className="text-[10px] font-black tracking-tighter text-slate-600">{user.phone || 'N/A'}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${user.isActive
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-rose-50 border-rose-100 text-rose-600"
                      }`}>
                      <div className={`w-1 h-1 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {user.isActive ? "Live" : "Halt"}
                    </div>
                  </td>

                  {/* Sync Date */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold">
                      <Calendar size={10} className="text-slate-300" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleStatusInitiation(user._id, user.isActive)} // 🔥 Opens Modal First
                        className={`p-2.5 rounded-xl transition-all ${user.isActive
                            ? "hover:bg-rose-50 text-slate-300 hover:text-rose-600"
                            : "hover:bg-emerald-50 text-slate-300 hover:text-emerald-600"
                          }`}
                      >
                        {user.isActive ? <UserX size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <button className="p-2 text-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
            Registry_Module // Node_Control_Active
          </p>
          <div className="flex gap-1.5">
            <button className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-900 hover:text-white transition-all">
              <ChevronLeft size={14} />
            </button>
            <button className="p-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-900 hover:text-white transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      {/* --- AUDIT REASON MODAL --- */}
      {reasonModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl space-y-8">

            <div>
              <h3 className="text-xl font-black tracking-tighter italic uppercase text-slate-900">
                Action <span className="text-slate-300 font-light not-italic">Justification.</span>
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Protocol: {reasonModal.currentStatus ? 'Deactivate_Node' : 'Activate_Node'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audit_Log_Reason</label>
              <textarea
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="ENTER_REASON_FOR_REGISTRY_LOG..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest min-h-[120px] focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setReasonModal({ show: false })}
                className="flex-1 py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all"
              >
                Abort
              </button>
              <button
                onClick={toggleStatus}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${reasonModal.currentStatus
                    ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700'
                    : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                  }`}
              >
                Confirm_Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;