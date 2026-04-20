import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, MessageSquare, Filter, Search, 
  ArrowUpRight, MessageCircle, ShieldCheck, 
  Send, X, Activity, User, CheckCircle
} from "lucide-react";
import reviewService from "../../services/reviewService";

const TechnicianReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState({ rating: "", status: "published" });

  useEffect(() => {
    fetchReviewData();
  }, [filter]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getTechReviews(filter);
      setReviews(res.data.data);
      // Mocking stats logic based on available data for the HUD
      const average = res.data.data.reduce((acc, r) => acc + r.score, 0) / (res.data.data.length || 1);
      setStats({ average: average.toFixed(1), total: res.data.data.length });
    } catch (err) {
      console.error("REVIEW_SYNC_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    try {
      await reviewService.respondToReview(replyTarget._id, replyText);
      setReplyTarget(null);
      setReplyText("");
      fetchReviewData(); // Refresh Registry
    } catch (err) {
      alert("RESPONSE_PROTOCOL_FAILED");
    }
  };

  if (loading && reviews.length === 0) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-[10px] tracking-[0.4em]">
       SYNCING_REVIEW_REGISTRY...
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20 pt-24 px-6 lg:px-12">
      
      {/* --- HUD HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-50 pb-12 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Feedback_Telemetry_v3</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter italic leading-none uppercase">
            Review <span className="text-slate-200 font-light not-italic">Analytics.</span>
          </h1>
        </div>

        <div className="flex gap-4">
          <StatMini label="Avg_Score" val={stats?.average || "0.0"} />
          <StatMini label="Total_Logs" val={stats?.total || "0"} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- LEFT: FILTERS & TOOLS (3-cols) --- */}
        <aside className="lg:col-span-3 space-y-8">
          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
             <div className="flex items-center gap-3 mb-8 text-slate-400">
                <Filter size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Registry_Filter</span>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-300 uppercase block mb-3">Score_Threshold</label>
                  <select 
                    onChange={(e) => setFilter({...filter, rating: e.target.value})}
                    className="w-full bg-white border-none rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">ALL_RATINGS</option>
                    {[5,4,3,2,1].map(s => <option key={s} value={s}>{s}_STARS</option>)}
                  </select>
                </div>

                <div className="pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Auto_Moderation: ON</span>
                  </div>
                </div>
             </div>
          </section>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-2xl">
             <Activity size={24} className="text-indigo-400" />
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
               Responding to subject logs increases your Reputation Index by 15% on average.
             </p>
          </div>
        </aside>

        {/* --- RIGHT: REVIEW FEED (9-cols) --- */}
        <div className="lg:col-span-9 space-y-6">
          {reviews.length === 0 ? (
            <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
               <MessageSquare size={48} className="mx-auto text-slate-100 mb-6" />
               <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Zero_Review_Nodes_Detected</h3>
            </div>
          ) : (
            reviews.map((r, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                key={r._id} 
                className="group bg-white border border-slate-100 rounded-[3rem] p-10 hover:border-indigo-200 transition-all hover:shadow-2xl hover:shadow-slate-100"
              >
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  
                  {/* User Data Node */}
                  <div className="flex gap-6 items-start md:w-1/3">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black tracking-tighter text-slate-900 uppercase italic">
                        {r.user?.firstName} {r.user?.lastName}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">LOG_ID: {r.booking?.bookingId || 'INTERNAL'}</p>
                      <div className="flex gap-1 mt-3">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} size={10} className={`${i < r.score ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} />
                         ))}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-6">
                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 italic text-slate-600 font-medium text-sm leading-relaxed">
                      "{r.review}"
                    </div>

                    {/* Technician Response Logic */}
                    {r.response ? (
                      <div className="ml-6 p-6 bg-indigo-50/50 border-l-4 border-indigo-600 rounded-r-3xl">
                        <div className="flex items-center gap-2 mb-2">
                           <MessageCircle size={14} className="text-indigo-600" />
                           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">My_Response</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase">{r.response}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setReplyTarget(r)}
                        className="flex items-center gap-3 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest"
                      >
                        <ArrowUpRight size={14} /> Initialize_Response_Sequence
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                   <span className="text-[9px] font-mono text-slate-300 uppercase">{new Date(r.createdAt).toLocaleString()}</span>
                   <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified_Session</span>
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* --- RESPONSE MODAL OVERLAY --- */}
      <AnimatePresence>
        {replyTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReplyTarget(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                 <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Communication_Protocol</p>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Respond to Subject</h2>
                 </div>
                 <button onClick={() => setReplyTarget(null)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="p-6 bg-slate-50 rounded-2xl italic text-sm text-slate-500 border border-slate-100">
                    "{replyTarget.review}"
                 </div>
                 <textarea 
                    autoFocus
                    placeholder="ENTER_RESPONSE_DATA..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-3xl p-8 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/10 min-h-[180px] placeholder:text-slate-200"
                 />
                 <button 
                    onClick={handleReplySubmit}
                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:bg-indigo-600 flex items-center justify-center gap-4 active:scale-95"
                 >
                    <Send size={18} />
                    Commit_Response_Protocol
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatMini = ({ label, val }) => (
  <div className="bg-slate-50 p-5 px-8 rounded-2xl border border-slate-100 flex flex-col items-center">
     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-2xl font-black italic text-slate-900 tracking-tighter">{val}</p>
  </div>
);

export default TechnicianReviews;