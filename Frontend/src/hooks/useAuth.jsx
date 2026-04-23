import { createContext, useContext, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (data) => {
    const userData = data?.user || data;
    const token = data?.accessToken || data?.token;

    localStorage.setItem("user", JSON.stringify(userData));

    if (token) {
      localStorage.setItem("token", token);
    }

    setUser(userData); // ✅ GLOBAL UPDATE (Navbar will update instantly)

    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res?.data?.data?.user);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        token: localStorage.getItem("token"),
        isAuthenticated: !!user,
        login,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ same hook name (no change needed in components)
const useAuth = () => useContext(AuthContext);

export default useAuth;