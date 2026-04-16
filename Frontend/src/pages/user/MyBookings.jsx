import React, { useEffect, useState } from "react";
import API from "../../services/api";
import {
  Calendar,
  MapPin,
  Wrench,
  X,
  CreditCard,
  Info,
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/users/bookings");
        const data = res.data?.data?.data || [];

        console.log("🔥 FULL BOOKINGS DATA:", data);

        setBookings(data);
      } catch (err) {
        console.error("Bookings error:", err);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 pt-20 px-6">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          My Bookings
        </h1>
        <p className="text-gray-500">
          Track and manage all your service requests
        </p>
      </div>

      <div className="max-w-6xl mx-auto">

        {bookings.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-lg">
              No bookings yet 🚀
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-5 shadow hover:shadow-lg hover:-translate-y-1 transition"
              >
                {/* Appliance */}
                <div className="flex items-center gap-2 mb-1">
                  <Wrench size={18} className="text-indigo-500" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {booking.appliance?.name || "Appliance"}
                  </h2>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  {booking.appliance?.brand} {booking.appliance?.model}
                </p>

                {/* Status */}
                <span
                  className={`inline-block px-3 py-1 text-xs rounded-full mb-3 ${
                    statusColors[booking.status]
                  }`}
                >
                  {booking.status.replace("_", " ")}
                </span>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={16} />
                  <span>
                    {new Date(booking.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <MapPin size={16} />
                  <span>{booking.serviceAddress?.city}</span>
                </div>

                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-xl hover:scale-105 transition"
                >
                  View Details →
                </button>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* 🔥 FULL MODAL */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white w-[95%] max-w-2xl rounded-2xl p-6 shadow-xl relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="text-indigo-500" />
              <h2 className="text-2xl font-bold">
                {selectedBooking.appliance?.name}
              </h2>
            </div>

            <p className="text-gray-500 mb-3">
              {selectedBooking.appliance?.brand} {selectedBooking.appliance?.model}
            </p>

            <span
              className={`inline-block px-3 py-1 text-xs rounded-full mb-4 ${
                statusColors[selectedBooking.status]
              }`}
            >
              {selectedBooking.status}
            </span>

            {/* 🔥 Booking Info */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <p><strong>ID:</strong> {selectedBooking.bookingId}</p>
              <p><strong>Priority:</strong> {selectedBooking.priority}</p>
              <p><strong>Service:</strong> {selectedBooking.serviceType}</p>
              <p>
                <strong>Preferred:</strong>{" "}
                {new Date(selectedBooking.preferredDate).toLocaleDateString()} at{" "}
                {selectedBooking.preferredTime}
              </p>
            </div>

            {/* 🔥 Address */}
            <div className="mb-4">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <MapPin size={16} /> Address
              </div>
              <p className="text-sm text-gray-600">
                {selectedBooking.serviceAddress?.street},<br />
                {selectedBooking.serviceAddress?.city},{" "}
                {selectedBooking.serviceAddress?.state} -{" "}
                {selectedBooking.serviceAddress?.pincode}
              </p>
            </div>

            {/* 🔥 Issue */}
            <div className="mb-4">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Info size={16} /> Issue
              </div>
              <p className="bg-gray-100 p-3 rounded-lg text-sm">
                {selectedBooking.issueDescription}
              </p>
            </div>

            {/* 🔥 Cost */}
            <div className="mb-4">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <CreditCard size={16} /> Estimated Cost
              </div>

              <div className="grid grid-cols-2 text-sm text-gray-600 gap-2">
                <p>Base: ₹{selectedBooking.estimatedCost?.basePrice}</p>
                <p>Service: ₹{selectedBooking.estimatedCost?.serviceCharge}</p>
                <p>Emergency: ₹{selectedBooking.estimatedCost?.emergencyCharge}</p>
                <p>Parts: ₹{selectedBooking.estimatedCost?.sparePartsCost}</p>
                <p className="col-span-2 font-semibold text-indigo-600">
                  Total: ₹{selectedBooking.estimatedCost?.total}
                </p>
              </div>
            </div>

            {/* 🔥 Payment */}
            <div>
              <div className="flex items-center gap-2 font-semibold mb-1">
                <CreditCard size={16} /> Payment
              </div>
              <p className="text-sm text-gray-600">
                Status: {selectedBooking.payment?.status}
              </p>
              <p className="text-sm text-gray-600">
                Paid: ₹{selectedBooking.payment?.paidAmount}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;