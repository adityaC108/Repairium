import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-gray-900 text-white">
      
      {/* Logo */}
      <h1
        className="text-lg font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        Repairium
      </h1>

      {/* Nav Links */}
      <div className="flex gap-6 items-center">
        <button onClick={() => navigate("/services")} className="hover:text-gray-300">
          Services
        </button>
        <button onClick={() => navigate("/about")} className="hover:text-gray-300">
          About
        </button>
        <button onClick={() => navigate("/contact")} className="hover:text-gray-300">
          Contact
        </button>

        {/* Auth Button */}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 px-4 py-1 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;