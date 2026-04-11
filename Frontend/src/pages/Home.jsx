import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  // ✅ Centralized role-based redirect
  const getDashboardByRole = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "technician":
        return "/technician/dashboard";
      case "user":
      default:
        return "/user/dashboard";
    }
  };

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = getDashboardByRole(role);
      navigate(redirectPath);
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center px-6">
      
      {/* Hero */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold text-center"
      >
        Home Appliance Repair 🚀
      </motion.h1>

      <p className="mt-4 text-gray-400 text-center max-w-xl">
        Book trusted technicians for your home appliances. Fast, reliable, and
        secure service at your doorstep.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex gap-4">
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="border border-gray-500 px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          Register
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
        <div className="p-6 bg-gray-800 rounded-xl">⚡ Fast Booking</div>
        <div className="p-6 bg-gray-800 rounded-xl">
          🛠️ Verified Technicians
        </div>
        <div className="p-6 bg-gray-800 rounded-xl">💳 Secure Payments</div>
      </div>
    </div>
  );
};

export default Home;
