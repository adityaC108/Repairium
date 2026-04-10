import { useState, useEffect } from "react";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedRole) {
      setUser(storedUser);
      setRole(storedRole);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.role);
    localStorage.setItem("token", data.accessToken);

    setUser(data.user);
    setRole(data.role);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
  };

  return { user, role, login, logout };
};

export default useAuth;