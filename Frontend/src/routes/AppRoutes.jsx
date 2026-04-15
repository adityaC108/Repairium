import { Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ServicesPage from "../pages/ServicesPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";

// Dashboards
import UserDashboard from "../pages/user/Dashboard";
import TechnicianDashboard from "../pages/technician/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";

import BookingPage from "../pages/BookingPage";

// Protection
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ❌ Public Routes (only login/register allowed) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔒 PROTECTED ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <ContactPage />
          </ProtectedRoute>
        }
      />

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

      {/*booking */}


      <Route
        path="/book/:id"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["user"]}>
              <BookingPage />
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