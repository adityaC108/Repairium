import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-gray-900 text-white">
      <h1 className="text-lg font-bold">Repairium</h1>

      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Navbar;