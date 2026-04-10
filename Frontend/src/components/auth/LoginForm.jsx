import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", form, {
        withCredentials: true,
      });

      onLogin(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg font-medium hover:scale-[1.02] transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ✅ FIXED REGISTER NAVIGATION */}
        <p className="text-gray-400 text-sm text-center mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;