import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MapPin, User, HardHat, 
  Settings, IndianRupee, AlertCircle, CheckCircle2,
  Calendar, Info, Image as ImageIcon, Activity,
  ChevronRight, ClipboardList
} from 'lucide-react';
import adminService from '../../services/adminService';
import bookingService from '../../services/bookingService';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingDetailsForAdmin(bookingId);
        setData(res.data.booking);
      } catch (err) {
        console.error("MISSION_FETCH_ERROR", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="p-12 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Reconciling_Mission_Data...</div>;
  if (!data) return <div className="p-12 text-rose-500 font-black">MISSION_NOT_FOUND: Registry_Link_Broken</div>;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700 overflow-x-hidden">
      
      {/* --- HUD HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Registry_ID // {data.bookingId}</p>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase text-slate-900">
              Mission_<span className="text-slate-300 font-light not-italic">Status:</span> {data.status}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${data.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
              Priority: {data.priority}
           </span>
           <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
              Type: {data.serviceType}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT SECTOR: CLIENT & TECHNICIAN NODES --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Node */}
          <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm cursor-pointer"
            onClick={() => navigate(`/admin/users/${data.user._id}`)} 

          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <User size={14} className="text-indigo-600" /> Client_Information
            </h3>
            <div className="space-y-4">
              <InfoItem label="Full_Name" val={data.user.fullName} />
              <InfoItem label="Email_Registry" val={data.user.email} />
              <InfoItem label="Comms_Phone" val={data.user.phone} />
              <div className="pt-4 mt-4 border-t border-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={12}/> Service_Coordinates
                </p>
                <p className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase">
                  {data.serviceAddress.street}, {data.serviceAddress.city}, {data.serviceAddress.state} - {data.serviceAddress.pincode}
                </p>
              </div>
            </div>
          </section>

          {/* Technician Node */}
          <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm cursor-pointer"
            onClick={() => navigate(`/admin/technicians/${data.technician._id}`)} 

          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <HardHat size={14} className="text-indigo-600" /> Technician_Details
            </h3>
            {data.technician ? (
              <div className="space-y-4">
              <InfoItem label="Full_Name" val={data?.technician?.fullName || 'Not_Assigned'} />
              <InfoItem label="Email_Registry" val={data?.technician?.email || 'Not_Assigned'} />
              <InfoItem label="Comms_Phone" val={data?.technician?.phone || 'Not_Assigned'} />
              <div className="pt-4 mt-4 border-t border-slate-50">
              </div>
            </div>
            ):(<p className="text-[11px] p-10 text-center font-bold text-slate-700/90 leading-relaxed uppercase">!! Technician_Not_Assigned !!</p>)}
            
          </section>

          

          {/* Asset Telemetry */}
          <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Settings size={14} className="text-indigo-600" /> Asset_Registry
            </h3>
            <div className="space-y-4">
              <InfoItem label="Appliance" val={data.appliance.name} />
              <InfoItem label="Brand" val={data.appliance.brand} />
              <InfoItem label="Model" val={data.appliance.model} />
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mt-4">
                <p className="text-[9px] font-black text-rose-600 uppercase mb-1">Issue_Reported</p>
                <p className="text-[11px] font-bold text-rose-900 uppercase italic">"{data.issueDescription}"</p>
              </div>
            </div>
          </section>
        </div>

        {/* --- MIDDLE SECTOR: FINANCIAL & SCHEDULE --- */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Financial HUD */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <IndianRupee size={120} />
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Financial_Breakdown</h4>
              
              <div className="grid grid-cols-2 gap-10 mb-10">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Estimated_Total</p>
                  <p className="text-3xl font-black italic tracking-tighter text-indigo-400">₹{data.estimatedCost.total}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Actual_Total</p>
                  <p className="text-3xl font-black italic tracking-tighter text-emerald-400">₹{data.actualCost.total}</p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800">
                <CostLine label="Base_Service_Fee" val={data.estimatedCost.basePrice} />
                <CostLine label="Service_Commission" val={data.estimatedCost.serviceCharge} />
                <CostLine label="Added_Spare_Parts" val={data.actualCost.sparePartsCost} />
                <CostLine label="Emergency_Charge" val={data.estimatedCost.emergencyCharge} />
              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment_Status</p>
                 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${data.payment.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
                    {data.payment.status}
                 </span>
              </div>
            </div>
          </section>

          {/* Logistics Schedule */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Logistics_Schedule</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calendar size={18}/></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Preferred_Date</p>
                    <p className="text-sm font-black italic">{new Date(data.preferredDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Clock size={18}/></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Preferred_Time</p>
                    <p className="text-sm font-black italic">{data.preferredTime}</p>
                  </div>
                </div>
             </div>
          </section>
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm mt-6 relative overflow-hidden">
  {/* Background Decoration */}
  <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 pointer-events-none">
    <Clock size={120} />
  </div>

  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6 flex items-center gap-2">
    <Activity size={16} className="text-indigo-600" /> Temporal_Registry
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Completion Timestamp */}
    <div className="flex items-center gap-2">
      <div className={`p-3 rounded-2xl ${data.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
        <CheckCircle2 size={20} />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Completion_Timestamp</p>
        <p className="text-[9px] font-black italic uppercase">
          {data.timeline.find(t => t.status === 'completed')?.timestamp 
            ? new Date(data.timeline.find(t => t.status === 'completed').timestamp).toLocaleString()
            : "Awaiting_Finalization"}
        </p>
      </div>
    </div>

    {/* Duration Calculation */}
    <div className="flex items-center gap-4 ml-2">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Mission_Duration</p>
        <p className="text-xs font-black italic uppercase text-indigo-600">
          {(() => {
            const start = new Date(data.createdAt);
            const endNode = data.timeline.find(t => t.status === 'completed');
            
            if (endNode) {
              const end = new Date(endNode.timestamp);
              const diffInMs = end - start;
              const hours = Math.floor(diffInMs / (1000 * 60 * 60));
              const mins = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
              return `${hours}H ${mins}M Total_Time`;
            }
            
            return "Tracking_Active_Live...";
          })()}
        </p>
      </div>
    </div>
  </div>

  {/* Progress Bar Visual */}
  <div className="mt-8 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
    <div 
      className={`h-full transition-all duration-1000 ${data.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600 animate-pulse'}`}
      style={{ width: data.status === 'completed' ? '100%' : '65%' }}
    />
  </div>
</section>
        </div>

        {/* --- RIGHT SECTOR: MISSION TIMELINE --- */}
        <div className="lg:col-span-3">
  <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Activity size={14} className="text-indigo-600" /> Mission_Timeline
      </h3>
      <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-tighter">
        Live_Feed
      </span>
    </div>
    
    <div className="space-y-8 relative">
      {/* Dynamic Vertical Line (Base) */}
      <div className="absolute left-[15px] top-0 bottom-0 w-px bg-slate-100" />
      
      {/* Dynamic Progress Filler (Highlights the path already traveled) */}
      <div 
        className="absolute left-[15px] top-0 w-px bg-indigo-600 transition-all duration-1000" 
        style={{ height: `${(data.timeline.length - 1) * (100 / (data.timeline.length || 1))}%` }}
      />
      
      {data.timeline.map((step, idx) => {
        // A step is "Active" if it's the most recent entry in the array
        const isLatest = idx === data.timeline.length - 1;
        // A step is "Completed" if it's already happened
        const isCompleted = idx <= data.timeline.length - 1;

        return (
          <div key={step._id} className="relative pl-10 group">
            {/* The Node Dot */}
            <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 transition-all duration-500 ${
              isLatest 
                ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)] scale-110' 
                : isCompleted 
                  ? 'bg-indigo-400' 
                  : 'bg-slate-200'
            }`}>
              {isLatest ? (
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              ) : (
                <CheckCircle2 size={10} className="text-white opacity-60" />
              )}
            </div>

            {/* Content */}
            <div className={`transition-all duration-500 ${isLatest ? 'translate-x-1' : 'opacity-60 group-hover:opacity-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-tighter ${isLatest ? 'text-indigo-600' : 'text-slate-900'}`}>
                {step.status}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight mt-1">
                {step.note}
              </p>
              <p className={`text-[8px] font-mono mt-2 ${isLatest ? 'text-indigo-400 font-black' : 'text-slate-300'}`}>
                {new Date(step.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </section>
</div>
        

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const InfoItem = ({ label, val }) => (
  <div className="flex justify-between items-center group">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-[11px] font-bold text-slate-700 italic group-hover:text-indigo-600 transition-colors">{val || 'NULL'}</span>
  </div>
);

const CostLine = ({ label, val }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-black italic tracking-tighter">₹{val}</span>
  </div>
);

export default BookingDetail;