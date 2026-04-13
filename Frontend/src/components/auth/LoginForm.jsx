import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      onLogin(res.data.data || res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Glow background */}
      <div className="absolute w-72 h-72 bg-gray-500 blur-[220px] rounded-full bottom-20 left-10" />
      <div className="absolute w-72 h-72 bg-slate-500 blur-[150px] rounded-full top-20 right-10" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass rounded-2xl p-8 shadow-xl bg-slate-100"
      >
        <h2 className="text-2xl font-display font-bold text-center mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 cursor-pointer text-muted-foreground"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-glow transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-muted-foreground">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-primary cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;