import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (data) => {
    login(data);

    if (data.role === "admin") navigate("/admin/dashboard");
    else if (data.role === "technician") navigate("/technician/dashboard");
    else navigate("/dashboard");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default Login;