import { useState } from "react";

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (data) => {
    // data = res.data.data
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.accessToken);

    setUser(data.user);

    return data; // ✅ useful for redirect
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return {
    user,
    role: user?.role, // ✅ derive role
    token: localStorage.getItem("token"),
    isAuthenticated: !!user, // ✅ important
    login,
    logout,
  };
};

export default useAuth;
