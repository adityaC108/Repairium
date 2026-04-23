import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  ShieldCheck, ShieldAlert, Activity, Clock, 
  User as UserIcon, Settings, Globe, Hash
} from 'lucide-react';
import adminService from '../../services/adminService';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const res = await adminService.getUserById(userId);
        setData(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("USER_TELEMETRY_LINK_FAILED", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  if (loading) return <div className="p-12 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-slate-400">Initializing_User_Node_Reconciliation...</div>;
  if (!data) return <div className="p-12 text-rose-500 font-black uppercase tracking-widest">Node_Offline: Identity_Not_Found</div>;

  const { profile, activity } = data;

  return (
    <div className="max-w-full space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* --- HUD NAVIGATION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">User_Identity // Client_Node</p>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
              {profile.firstName} <span className="text-slate-300 font-light not-italic">{profile.lastName}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${
              profile.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
           }`}>
             <div className={`w-1.5 h-1.5 rounded-full ${profile.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
             {profile.isActive ? 'Status: Active' : 'Status: Halted'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SECTOR: IDENTITY & SECURITY --- */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Identity Card */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="w-28 h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl relative overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="User_Node" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.firstName[0]}{profile.lastName[0]}</span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal_Reference</p>
                <code className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">#{profile._id.toUpperCase()}</code>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-8">
              <DataRow icon={<Mail size={14}/>} label="Email" val={profile.email} />
              <DataRow icon={<Phone size={14}/>} label="Phone_Registry" val={profile.phone} />
              <DataRow icon={<Globe size={14}/>} label="Account_Role" val={profile.role} />
              <div className="pt-4">
                <div className={`flex items-center gap-2 p-3 rounded-2xl border ${profile.isVerified ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-amber-50/50 border-amber-100 text-amber-700'}`}>
                  {profile.isVerified ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {profile.isVerified ? 'Identity_Verified' : 'Pending_Verification'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Timestamp Telemetry */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Node_Lifecycle</h4>
            <div className="space-y-4">
              <TimePoint icon={<Calendar size={14}/>} label="Created_At" date={profile.createdAt} />
              <TimePoint icon={<Activity size={14}/>} label="Last_Update" date={profile.updatedAt} />
              <TimePoint icon={<Clock size={14}/>} label="Last_Login" date={profile.lastLogin} />
            </div>
          </section>
        </div>

        {/* --- RIGHT SECTOR: GEOGRAPHY & ACTIVITY --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Activity HUD Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Service_Engagements</p>
              <p className="text-4xl font-black italic tracking-tighter text-slate-900">{activity.totalBookings}</p>
            </div>
            <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white">
              <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-2">Node_Integrity</p>
              <p className="text-4xl font-black italic tracking-tighter">{profile.isActive ? '100%' : '0.0%'}</p>
            </div>
          </div>

          {/* Geographic Registry */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8 flex items-center gap-3">
              <MapPin size={18} className="text-indigo-600" /> Geographic_Registry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <AddressBlock label="Street_Address" val={profile.address.street} />
              <AddressBlock label="City_Node" val={profile.address.city} />
              <AddressBlock label="State_Registry" val={profile.address.state} />
              <AddressBlock label="Postal_Code" val={profile.address.pincode} />
            </div>
          </section>

          {/* Booking History Log */}
          {/* --- BOOKING HISTORY LOG --- */}
<section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
  <div className="flex justify-between items-center mb-8">
    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
      <Settings size={18} className="text-indigo-600" /> Recent_Engagements
    </h3>
    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
      LOGS: {activity.recentBookings.length}
    </span>
  </div>
  
  {activity.recentBookings.length > 0 ? (
    <div className="space-y-4">
      {activity.recentBookings.map((booking) => (
        <div 
          key={booking._id} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-slate-900 hover:text-white transition-all duration-300 cursor-pointer"
          onClick={() => navigate(`/admin/bookings/${booking._id}`)}
        >
          <div className="flex items-center gap-5">
            {/* Status Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
              booking.status === 'completed' 
              ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' 
              : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white'
            }`}>
              <Activity size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:text-indigo-300 transition-colors">
                  ID_{booking.bookingId || booking._id.slice(-8).toUpperCase()}
                </p>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 uppercase tracking-tighter">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm font-black uppercase italic tracking-tight mt-1">
                {booking.appliance?.name || "General_System_Maintenance"}
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-1">
             <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
               booking.status === 'completed' 
               ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
               : 'bg-indigo-50 border-indigo-200 text-indigo-700'
             }`}>
               {booking.status}
             </div>
             <p className="text-xs font-black tracking-tighter group-hover:text-white transition-colors">
                ₹{booking.actualCost?.total || booking.estimatedCost?.total || '0.00'}
             </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    /* --- FALLBACK: EMPTY REGISTRY --- */
    <div className="py-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Hash size={32} strokeWidth={1.5} className="text-slate-200" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        No_Engagement_History_Logged
      </p>
      <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-widest">
        Registry_Status: Standby
      </p>
    </div>
  )}
</section>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const DataRow = ({ icon, label, val }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-3 text-slate-400">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-[11px] font-bold text-slate-700">{val || 'N/A'}</span>
  </div>
);

const TimePoint = ({ icon, label, date }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-[11px] font-bold text-slate-200">
        {date ? new Date(date).toLocaleString() : 'NEVER'}
      </p>
    </div>
  </div>
);

const AddressBlock = ({ label, val }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-800 uppercase italic tracking-tight">{val || 'NULL_DATA'}</p>
  </div>
);

export default UserDetail;