import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // 🔥 Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 🔥 Fetch booking initially
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await API.get(`/bookings/user/bookings/${bookingId}`);

        console.log("BOOKING 👉", res.data);

        setBooking(res.data.data.booking);
      } catch (err) {
        console.error("BOOKING ERROR 👉", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // 🔥 Poll until technician assigned
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/bookings/user/bookings/${bookingId}`);
        const updatedBooking = res.data.data.booking;

        setBooking(updatedBooking);

        if (updatedBooking?.technician) {
          showToast("Technician Assigned ✅");
          clearInterval(interval);
        }

      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingId]);

  // 🔥 Create Order
  const createOrder = async () => {
    try {
      if (!booking?.technician?._id) {
        showToast("Waiting for technician...");
        return;
      }

      const payload = {
        amount: booking?.pricing?.total || 2500,
        notes: {
          bookingId: bookingId,
          technicianId: booking.technician._id,
          paymentMethod: "upi"
        }
      };

      console.log("CREATE ORDER 👉", payload);

      const res = await API.post("/payments/create-order", payload);

      console.log("ORDER 👉", res.data);

      return res.data.data;

    } catch (err) {
      console.error("CREATE ORDER ERROR 👉", err.response?.data);
      showToast("Payment init failed ❌");
    }
  };

  // 🔥 Verify Payment
  const verifyPayment = async (response, paymentId) => {
    try {
      await API.post("/payments/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        paymentId
      });

      showToast("Payment Successful 🎉");

      setTimeout(() => {
        navigate(`/booking-success/${bookingId}`);
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast("Payment verification failed ❌");
    }
  };

  // 🔥 Open Razorpay
  const handlePayment = async () => {
    try {
      const order = await createOrder();

      if (!order) return;

      const user = JSON.parse(localStorage.getItem("user"));

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "Repairium",
        description: "Service Payment",
        order_id: order.orderId,

        handler: function (response) {
          verifyPayment(response, order.paymentId);
        },

        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: user?.phone
        },

        theme: { color: "#000" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      showToast("Payment failed ❌");
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Loading booking...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-20 p-6">

      {/* 🔥 Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

      {/* Booking Info */}
      <div className="bg-slate-100 p-5 rounded-xl mb-6">
        <h2 className="font-bold text-lg">
          {booking?.appliance?.name}
        </h2>

        <p className="text-gray-500">
          {booking?.appliance?.brand}
        </p>

        <p className="text-xl font-semibold mt-3">
          ₹{booking?.pricing?.total || 2500}
        </p>
      </div>

      {/* Technician Status */}
      {!booking?.technician && (
        <div className="text-center mb-6">
          <p className="text-gray-500">
            🔍 Finding technician... please wait
          </p>
        </div>
      )}

      {booking?.technician && (
        <div className="bg-green-100 p-4 rounded-xl mb-6">
          <p className="text-green-700 font-medium">
            Technician Assigned ✅
          </p>
          <p className="text-sm text-gray-600">
            {booking.technician?.name || "Technician"}
          </p>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={!booking?.technician}
        className={`w-full py-4 rounded-xl text-lg transition ${
          booking?.technician
            ? "bg-black text-white hover:scale-105"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {booking?.technician
          ? "Pay Now 💳"
          : "Waiting for Technician..."}
      </button>

    </div>
  );
};

export default PaymentPage;