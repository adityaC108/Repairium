import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi"; // 👁️ add this

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
  const [error, setError] = useState(""); // ✅ NEW
  const [showPassword, setShowPassword] = useState(false);

  const isLocationRequired = role === "user" || role === "technician";

  const handleChange = (e) => {
    setError(""); // clear error on typing
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setError("");
    setForm({
      ...form,
      address: {
        ...form.address,
        [e.target.name]: e.target.value,
      },
    });
  };

  const getEndpoint = () => {
    if (role === "admin") return "/auth/register/admin";
    if (role === "technician") return "/auth/register/technician";
    return "/auth/register/user";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATIONS
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      return setError("Please fill all required fields");
    }

    // ✅ Clean phone validation (no 0 or +91)
    if (form.phone.startsWith("0") || form.phone.startsWith("+91")) {
      return setError("Don't start with 0 and with +91");
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return setError("Enter valid phone number");
    }

    // ✅ Password validation (backend aligned)
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(form.password)) {
      return setError("Password does not meet requirements and must contain more then 6 letters");
    }

    if (isLocationRequired) {
      const { street, city, state, pincode } = form.address;

      if (!street || !city || !state || !pincode) {
        return setError("Please fill complete address");
      }

      if (!/^\d{6}$/.test(pincode)) {
        return setError("Enter valid 6-digit pincode");
      }
    }

    setLoading(true);
    setError("");

    try {
      const payload = isLocationRequired
        ? form
        : { ...form, address: undefined };

      const res = await API.post(getEndpoint(), payload);

      onRegister(res.data.data);
    } catch (err) {
      console.log("ERROR:", err.response?.data);

      // ✅ Show backend error in UI
      setError(err.response?.data?.message || "Registration failed");
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

        {/* ✅ ERROR UI */}
        {error && (
          <div className="bg-red-500/20 text-red-300 text-sm p-2 rounded mb-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <div className="flex gap-2">
            <input name="firstName" placeholder="First Name" onChange={handleChange} className="input" />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} className="input" />
          </div>

          <input name="email" placeholder="Email" onChange={handleChange} className="input" />
          {/* PHONE */}
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="input"
          />

          {/* PASSWORD */}
          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="input w-full pr-10"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-300 hover:text-white transition"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
          </div>

          {/* 🔥 PASSWORD HINT */}
          <p className="text-xs text-gray-400">
            Password must contain at least one uppercase letter, one lowercase letter, and one number
          </p>

          {isLocationRequired && (
            <div className="border border-white/20 rounded-lg p-3 mt-1 flex flex-col gap-2">
              <p className="text-xs text-gray-300">Service Location</p>

              <input name="street" placeholder="Street" onChange={handleAddressChange} className="input" />
              <input name="city" placeholder="City" onChange={handleAddressChange} className="input" />

              <div className="flex gap-2">
                <input name="state" placeholder="State" onChange={handleAddressChange} className="input" />
                <input name="pincode" placeholder="Pincode" onChange={handleAddressChange} className="input" />
              </div>
            </div>
          )}

          <button
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg mt-2"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

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