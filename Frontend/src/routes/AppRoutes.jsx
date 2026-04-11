import { Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Dashboards
import UserDashboard from "../pages/user/Dashboard";
import TechnicianDashboard from "../pages/technician/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";

// Routes Protection
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* USER */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["user"]}>
              <UserDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* TECHNICIAN */}
      <Route
        path="/technician/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["technician"]}>
              <TechnicianDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<h1 className="text-center mt-10">404 Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;