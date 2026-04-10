import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import RoleSelector from "../../components/auth/RoleSelector";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = (data) => {
    login(data);

    if (data.role === "admin") navigate("/admin/dashboard");
    else if (data.role === "technician") navigate("/technician/dashboard");
    else navigate("/dashboard");
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