import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import useAuth from "../../hooks/useAuth";

const Login = () => {
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
        return "/user/dashboard";
    }
  };

  const handleLogin = (data) => {
    login(data);

    const role = data?.user?.role;
    const redirectPath = getDashboardByRole(role); // ✅ use function

    navigate(redirectPath);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default Login;