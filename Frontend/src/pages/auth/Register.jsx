import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import RoleSelector from "../../components/auth/RoleSelector";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ Centralized role-based redirect
  const getDashboardByRole = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "technician":
        return "/technician/dashboard";
      case "user":
      default:
        return "/";
    }
  };

  const handleRegister = (data) => {
    login(data);

    // ✅ FIX: safer role detection (backend sends both)
    
    const userRole = data?.role || data?.user?.role;

    const redirectPath = getDashboardByRole(userRole);

    navigate(redirectPath);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {!role ? (
        <RoleSelector setRole={setRole} />
      ) : (
        <RegisterForm role={role} onRegister={handleRegister} />
      )}
    </div>
  );
};

export default Register;