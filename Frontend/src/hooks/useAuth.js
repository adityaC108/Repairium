import { useState } from "react";
import API from "../services/api";

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.accessToken);

    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.data.user);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  return {
    user,
    role: user?.role,
    token: localStorage.getItem("token"),
    isAuthenticated: !!user,
    login,
    logout,
    fetchCurrentUser,
  };
};

export default useAuth;