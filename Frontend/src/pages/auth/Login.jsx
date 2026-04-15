import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const getDashboardByRole = (role) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "technician") return "/technician/dashboard";
    return "/"; // user
  };

  const handleLogin = (data) => {
    // 🔥 DEBUG LOGS
    console.log("FULL LOGIN RESPONSE 👉", data);
    console.log("USER 👉", data?.user);
    console.log("ROLE 👉", data?.user?.role || data?.role);

    // Clean formatted view
    console.log("FORMATTED 👉", JSON.stringify(data, null, 2));

    // Save login
    login(data);

    const role = data?.user?.role || data?.role || "user";
    const redirectPath = getDashboardByRole(role);

    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default Login;