import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const RegisterForm = ({ role, onRegister }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      coordinates: [0, 0],
    },
  });

  const [loading, setLoading] = useState(false);

  const isLocationRequired = role === "user" || role === "technician";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setForm({
      ...form,
      address: {
        ...form.address,
        [e.target.name]: e.target.value,
      },
    });
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [
        pos.coords.longitude,
        pos.coords.latitude,
      ];

      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          coordinates: coords,
        },
      }));
    });
  };

  const getEndpoint = () => {
    if (role === "admin") return "/api/auth/register/admin";
    if (role === "technician") return "/api/auth/register/technician";
    return "/api/auth/register/user";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = isLocationRequired
        ? form
        : {
            ...form,
            address: undefined, // ❌ remove for admin
          };

      const res = await axios.post(getEndpoint(), payload, {
        withCredentials: true,
      });

      onRegister(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-white text-center mb-4">
          Register as <span className="text-blue-400">{role}</span>
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* NAME */}
          <div className="flex gap-2">
            <input name="firstName" placeholder="First Name" onChange={handleChange} className="input" />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} className="input" />
          </div>

          {/* BASIC */}
          <input name="email" placeholder="Email" onChange={handleChange} className="input" />
          <input name="phone" placeholder="Phone" onChange={handleChange} className="input" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input" />

          {/* 📍 ADDRESS ONLY FOR USER + TECHNICIAN */}
          {isLocationRequired && (
            <div className="border border-white/20 rounded-lg p-3 mt-1 flex flex-col gap-2">
              
              <p className="text-xs text-gray-300">Service Location</p>

              <input name="street" placeholder="Street" onChange={handleAddressChange} className="input" />
              <input name="city" placeholder="City" onChange={handleAddressChange} className="input" />

              <div className="flex gap-2">
                <input name="state" placeholder="State" onChange={handleAddressChange} className="input" />
                <input name="pincode" placeholder="Pincode" onChange={handleAddressChange} className="input" />
              </div>

              <button
                type="button"
                onClick={getLocation}
                className="text-xs bg-blue-500/20 text-blue-300 py-1 rounded-md hover:bg-blue-500/30 transition"
              >
                📍 Use Current Location
              </button>
            </div>
          )}

          <button
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg mt-2"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        {/* NAV */}
        <p className="text-gray-400 text-xs text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterForm;