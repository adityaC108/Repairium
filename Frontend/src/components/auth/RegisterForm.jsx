import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isLocationRequired = role === "user" || role === "technician";

  const handleChange = (e) => {
    setError("");
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

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      return setError("Please fill all required fields");
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
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Glow */}
      <div className="absolute w-72 h-72 bg-gray-500 blur-[220px] rounded-full bottom-20 left-10" />
      <div className="absolute w-72 h-72 bg-slate-500 blur-[150px] rounded-full top-20 right-10" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-slate-100 backdrop-blur-xl border border-gray-200 rounded-2xl p-8 shadow-xl"
      >
        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Register as <span className="text-primary">{role}</span>
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name */}
          <div className="flex gap-3">
            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          {/* Email */}
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
          />

          {/* Phone */}
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-800"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Must include uppercase, lowercase & number
          </p>

          {/* Address */}
          {isLocationRequired && (
            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs text-gray-500">Service Location</p>

              <input
                name="street"
                placeholder="Street"
                onChange={handleAddressChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />

              <input
                name="city"
                placeholder="City"
                onChange={handleAddressChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />

              <div className="flex gap-3">
                <input
                  name="state"
                  placeholder="State"
                  onChange={handleAddressChange}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />

                <input
                  name="pincode"
                  placeholder="Pincode"
                  onChange={handleAddressChange}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
            </div>
          )}
          {/* Button */}
          <button
            disabled={loading}
            className="bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-glow transition"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-black cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterForm;