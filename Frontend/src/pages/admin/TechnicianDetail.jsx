import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, ShieldCheck, ShieldAlert,
    Star, Briefcase, IndianRupee, MapPin, Calendar,
    ExternalLink, CheckCircle2, XCircle, Clock, FileText, Activity
} from 'lucide-react';
import adminService from '../../services/adminService';

const TechnicianDetail = () => {
    const { techId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Audit States
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchDetails = async (techId) => {
            try {
                const res = await adminService.getTechnicianById(techId);
                setData(res.data);
                console.log(res.data);
            } catch (err) {
                console.error("TELEMETRY_LINK_FAILED", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails(techId);
    }, [techId]);

    const handleDocumentAction = async (docType, status) => {
        const reason = prompt(`Enter Audit Justification for ${docType}:`);
        if (!reason) return;

        try {
            setProcessing(true);
            // Assuming payload structure for document verification
            await adminService.verifyTechnicianDocument(techId, docType, {
                status: status,
                reason: reason
            });
            // Refresh Data
            const updated = await adminService.getTechnicianById(techId);
            setData(updated.data);
        } catch (err) {
            alert("DOCUMENT_PROTOCOL_FAILED");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-12 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing_Node_Reconciliation...</div>;
    if (!data) return <div className="p-12 text-rose-500 font-black">NODE_OFFLINE: Data corrupted or not found.</div>;

    const { profile, stats, history } = data;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">

            {/* --- HUD NAVIGATION --- */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Technician_Node</p>
                    <h1 className="text-3xl font-black tracking-tighter italic uppercase text-slate-900">
                        {profile.firstName} <span className="text-slate-300 font-light not-italic">{profile.lastName}</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT SECTOR: PROFILE & TELEMETRY --- */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Identity Card */}
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl relative">
                                <img src={profile.avatar} alt="" className="w-full h-full object-cover rounded-[2.3rem]" />
                                <div className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-white rounded-full ${profile.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System_Callsign</p>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 italic">ID_{profile._id.slice(-8).toUpperCase()}</h3>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                            <InfoRow icon={<Mail size={14} />} label="Email" value={profile.email} />
                            <InfoRow icon={<Phone size={14} />} label="Comms" value={profile.phone} />
                            <InfoRow icon={<Briefcase size={14} />} label="Exp" value={`${profile.experience} Standard Years`} />
                            <div className="flex flex-wrap gap-2 pt-2">
                                {profile.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-slate-100 text-[8px] font-black uppercase rounded-lg text-slate-500 tracking-wider">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Earnings HUD */}
                    <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Financial_Yield</h4>
                            <IndianRupee size={16} className="text-emerald-500" />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Total_Reconciled</p>
                                <p className="text-3xl font-black italic tracking-tighter">₹{profile.earnings.total.toLocaleString()}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                <div>
                                    <p className="text-[8px] font-bold text-amber-500 uppercase">Pending_Sync</p>
                                    <p className="text-lg font-black tracking-tighter italic">₹{profile.earnings.pending.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-indigo-400 uppercase">Withdrawn</p>
                                    <p className="text-lg font-black tracking-tighter italic">₹{profile.earnings.withdrawn.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* --- BANK SETTLEMENT AUDIT --- */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm mt-8">
                        <div className="flex flex-col items-center justify-center">
                            <div className='mb-4 '>
                                <span className={`px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border ${profile.bankDetails.isVerified
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                        : 'bg-amber-50 border-amber-100 text-amber-600'
                                    }`}>
                                    {profile.bankDetails.isVerified ? 'VERIFIED' : 'PENDING'}
                                </span>
                            </div>
                            <h3 className="text-xs font-black uppercase text-slate-900 mb-6 flex items-center gap-3">
                                <IndianRupee size={16} className="text-emerald-600" /> Bank_Settlement_Registry
                            </h3>


                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 relative overflow-hidden">
                            {/* Status Indicator */}


                            <div className="grid grid-cols-1 gap-4">
                                <BankDataPoint label="Account_Holder" val={profile.bankDetails.accountHolder} />
                                <BankDataPoint label="Account_Number" val={profile.bankDetails.accountNumber} />
                                <BankDataPoint label="Bank_Name" val={profile.bankDetails.bankName} />
                                <BankDataPoint label="IFSC_Code" val={profile.bankDetails.ifscCode} />
                            </div>

                            {/* Verification Controls */}
                            {!profile.bankDetails.isVerified && (
                                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3 flex flex-col item-center">
                                    <button
                                        onClick={() => handleDocumentAction('bankDetails', 'verified')}
                                        className="flex-1 py-4 px-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => handleDocumentAction('bankDetails', 'rejected')}
                                        className="px-8 py-4 bg-white border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                </div>

                {/* --- RIGHT SECTOR: DOCUMENT AUDIT & HISTORY --- */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Mission HUD Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatBox label="Total_Missions" val={stats.totalMissions} color="text-indigo-600" />
                        <StatBox label="Successful_Ops" val={stats.completedMissions} color="text-emerald-500" />
                        <StatBox label="Rating_Metric" val={profile.rating.average} color="text-amber-500" />
                    </div>

                    {/* Document Verification Registry */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8 flex items-center gap-3">
                            <ShieldCheck size={18} className="text-indigo-600" /> Identity_Verification_Registry
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DocAuditCard
                                label="Aadhar_Node"
                                data={profile.documents.aadharCard}
                                onApprove={() => handleDocumentAction('aadharCard', 'verified')}
                                onReject={() => handleDocumentAction('aadharCard', 'rejected')}
                            />
                            <DocAuditCard
                                label="PAN_Node"
                                data={profile.documents.panCard}
                                onApprove={() => handleDocumentAction('panCard', 'verified')}
                                onReject={() => handleDocumentAction('panCard', 'rejected')}
                            />
                            <DocAuditCard
                                label="Address_Proof"
                                data={profile.documents.addressProof}
                                onApprove={() => handleDocumentAction('addressProof', 'verified')}
                                onReject={() => handleDocumentAction('addressProof', 'rejected')}
                            />
                            <DocAuditCard
                                label="Police_Auth"
                                data={profile.documents.policeVerification}
                                onApprove={() => handleDocumentAction('policeVerification', 'verified')}
                                onReject={() => handleDocumentAction('policeVerification', 'rejected')}
                            />
                        </div>
                    </section>

                    {/* Recent Mission History */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Recent_Mission_Logs</h3>
                        <div className="space-y-4">
                            {history.map(mission => (
                                <div key={mission._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-slate-900 hover:text-white transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:text-indigo-400">{mission?.bookingId || 'N/A'}</p>
                                            <p className="text-sm font-black uppercase italic">{mission?.appliance?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status: {mission?.status || 'N/A'}</p>
                                        <p className="text-xs font-black">₹{mission.actualCost.total}</p>
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

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3 text-slate-400">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[11px] font-bold text-slate-700">{value}</span>
    </div>
);

const StatBox = ({ label, val, color }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-4xl font-black italic tracking-tighter ${color}`}>{val}</p>
    </div>
);

const DocAuditCard = ({ label, data, onApprove, onReject }) => (
    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${data.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {data.status}
            </span>
        </div>
        <a href={data.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
            <FileText size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Review_Asset</span>
            <ExternalLink size={12} />
        </a>
        {/* 🔥 THE FIX: Check both conditions independently */}
        {data.status !== 'verified' && data.status !== 'rejected' && (
            <div className="flex gap-2 pt-2">
                <button
                    disabled={processing}
                    onClick={onApprove}
                    className="... disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? 'SYNCING...' : 'Approve_Node'}
                </button>
                <button
                    onClick={onReject}
                    className="flex-1 py-2 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-600 transition-all active:scale-95"
                >
                    Reject_Node
                </button>
            </div>
        )}
    </div>
);

const BankDataPoint = ({ label, val }) => (
    <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{val || 'NOT_PROVIDED'}</p>
    </div>
);
export default TechnicianDetail;