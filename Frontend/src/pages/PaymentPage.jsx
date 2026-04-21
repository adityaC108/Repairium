import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Zap, 
  MapPin, 
  User, 
  CreditCard, 
  ArrowRight, 
  Activity,
  Package,
  CheckCircle,
  Clock
} from "lucide-react";
import API from "../services/api";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchBooking = async () => {
    try {
      const res = await API.get(`/bookings/user/bookings/${bookingId}`);
      const data = res.data.data.booking;
      
      // Update local state if status or price changed
      if (booking?.status !== data.status) {
      }
      setBooking(data);
    } catch (err) {
      console.error("DATA_SYNC_ERROR 👉", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Engine Polling: Sync data every 4 seconds for real-time status updates
    const interval = setInterval(fetchBooking, 4000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const createOrder = async () => {
    try {
      if (!booking?.technician?._id) {
        showToast("Technician Assignment Pending...");
        return;
      }

      // Logic Fix: Use actualCost total if available (comes from technician), 
      // otherwise fallback to estimatedCost total.
      const finalAmount = booking?.actualCost?.total || booking?.estimatedCost?.total || 2500;

      const payload = {
        amount: finalAmount,
        notes: {
          bookingId: bookingId,
          technicianId: booking.technician._id,
          paymentMethod: "upi"
        }
      };

      const res = await API.post("/payments/create-order", payload);
      return res.data.data;
    } catch (err) {
      showToast("Payment Protocol Failed ❌");
    }
  };

  const verifyPayment = async (response, paymentId) => {
    try {
      await API.post("/payments/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        paymentId
      });

      showToast("Node Resolution Confirmed 🎉");
      setTimeout(() => navigate(`/booking-success/${bookingId}`), 1500);
    } catch (err) {
      showToast("Verification Protocol Failed ❌");
    }
  };

  const handlePayment = async () => {
    try {
      const order = await createOrder();
      if (!order) return;

      const user = JSON.parse(localStorage.getItem("user"));

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "REPAIRIUM_SYS",
        description: `Service_Node: ${booking.bookingId}`,
        order_id: order.orderId,
        handler: (res) => verifyPayment(res, order.paymentId),
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: "#4f46e5" } // Indigo-600
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast("Gateway Error ❌");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Activity className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  // Dynamic Cost Logic for Display
  const cost = booking?.actualCost?.total > 0 ? booking.actualCost : booking.estimatedCost;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* Toast Terminal */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-[0.3em] animate-in fade-in zoom-in duration-300">
          {toast}
        </div>
      )}

      {/* Header Space */}
      <header className="pt-24 pb-12 px-6 border-b border-slate-50">
        <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Final_Reconciliation</span>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter italic leading-none mt-2">
              Economic <span className="text-slate-200 font-light italic">Clearance</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className={`w-2 h-2 rounded-full ${booking.technician ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{booking.status}</span>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: MISSION SUMMARY */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8">Service_Manifest</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hardware_Unit</p>
                  <p className="text-lg font-black tracking-tight">{booking?.appliance?.brand} {booking?.appliance?.name}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deployment_Site</p>
                  <p className="text-sm font-bold opacity-80">{booking?.serviceAddress?.street}, {booking?.serviceAddress?.city}</p>
                </div>
              </div>
            </div>
          </section>

          {/* TECHNICIAN ASSIGNMENT */}
          <section className="p-6 border border-slate-100 rounded-[2.5rem] bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician_Node</h4>
               {booking.technician ? (
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-tighter">Verified_Link</span>
               ) : (
                 <span className="text-[8px] font-black text-amber-500 uppercase animate-pulse italic">Scanning_Fleet...</span>
               )}
            </div>
            
            {booking.technician ? (
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-xl font-black tracking-tighter italic uppercase">{booking.technician.firstName} {booking.technician.lastName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auth_ID: {booking.technician._id.slice(-8)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-300 italic">Waiting for technician to accept mission node...</p>
            )}
          </section>
          <div className="p-4 bg-indigo-50/50 rounded-[2rem] flex items-center gap-4">
             <ShieldCheck size={20} className="text-indigo-600" />
             <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">
               Transaction secured via RSA-2048 Node encryption.
             </p>
          </div>
        </div>

        {/* RIGHT: BILLING ENGINE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 text-center">Cost_Matrix_V3</h3>
            
            <div className="space-y-5">
              <BillingLine label="Base_Service_Fee" amount={cost?.basePrice} />
              <BillingLine label="Processing_Charge" amount={cost?.serviceCharge} />
              
              {/* FIXED: Spare Parts Logic */}
              <div className={`flex justify-between items-center py-2 ${cost?.sparePartsCost > 0 ? 'opacity-100' : 'opacity-30'}`}>
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spare_Parts_Cost</span>
                </div>
                <span className="font-mono text-sm font-black">₹{cost?.sparePartsCost || 0}</span>
              </div>

              {cost?.emergencyCharge > 0 && (
                <BillingLine label="Urgency_Protocol_Fee" amount={cost.emergencyCharge} />
              )}

              <div className="pt-8 mt-8 border-t-2 border-dashed border-slate-100">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em]">Total_Liability</p>
                    <p className="text-4xl font-black tracking-tighter italic">₹{cost?.total}</p>
                  </div>
                  <CheckCircle size={32} className={booking.technician ? 'text-indigo-600' : 'text-slate-100'} />
                </div>
              </div>
            </div>

            <button
  onClick={handlePayment}
  // Disable if no technician is assigned OR if the transaction is already finalized
  disabled={!booking?.technician || booking?.payment?.status === "paid"}
  className={`w-full mt-10 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group shadow-lg ${
    booking?.payment?.status === "paid"
      ? "bg-emerald-500 text-white cursor-default" // --- PAID STATE ---
      : booking?.technician
      ? "bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-indigo-100" // --- READY STATE ---
      : "bg-slate-100 text-slate-300 cursor-not-allowed" // --- LOCKED STATE ---
  }`}
>
  {/* Dynamic Icon Logic */}
  {booking?.payment?.status === "paid" ? (
    <CheckCircle size={18} className="animate-in zoom-in duration-300" />
  ) : (
    <CreditCard size={18} className={booking?.technician ? "text-amber-400" : ""} />
  )}

  {/* Dynamic Text Logic */}
  {booking?.payment?.status === "paid" 
    ? "Transaction_Finalized" 
    : booking?.technician 
    ? "Execute_Payment" 
    : "Awaiting_Tech_Link"}

  {/* Conditional Arrow (Hide if paid) */}
  {booking?.payment?.status !== "paid" && (
    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
  )}
</button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-component for Billing Lines
const BillingLine = ({ label, amount }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="font-mono text-sm font-bold text-slate-700">₹{amount || 0}</span>
  </div>
);

export default PaymentPage;