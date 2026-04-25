import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState(false);

  const getDashboardByRole = (role) => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "technician") return "/technician/dashboard";
    return "/"; // user
  };

  const handleLogin = (data) => {
    setLoginError(false);
    // Save login
    login(data);

    const role = data?.user?.role || data?.role || "user";
    const redirectPath = getDashboardByRole(role);

    navigate(redirectPath, { replace: true });
  };

  const handleLoginFailure = (err) => {
    console.error("AUTH_HANDSHAKE_FAILED:", err);
    setLoginError(true); // Trigger the recovery link visibility
  };

  return (
    <>
      <LoginForm 
      onLogin={handleLogin} 
      onFailure={handleLoginFailure}
        showForgotLink={loginError}
      />
    </>
  );
};

export default Login;