import React from "react";
import { useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">

      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Payment Successful 🎉
      </h1>

      <p className="text-gray-500 mb-6">
        Your booking is confirmed. Technician will contact you soon.
      </p>

      <button
        onClick={() => navigate("/user/dashboard")}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        Go to Dashboard
      </button>

    </div>
  );
};

export default BookingSuccess;