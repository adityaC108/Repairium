import { Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ServicesPage from "../pages/ServicesPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";

import BookingPage from "../pages/BookingPage";
import PaymentPage from "../pages/PaymentPage"; // ✅ NEW
import BookingSuccess from "../pages/BookingSuccess"; // ✅ NEW

// Dashboards
import UserDashboard from "../pages/user/Dashboard";
import TechnicianDashboard from "../pages/technician/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";

// ✅ ADD THESE HERE
import Users from "../pages/admin/Users";
import Technicians from "../pages/admin/Technicians";
import Bookings from "../pages/admin/Bookings";
import MyBookings from "../pages/user/MyBookings";

import Profile from "../pages/user/Profile";

// Protection
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ❌ Public Routes */}
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

      {/* ✅ FIXED PROFILE ROUTE */}
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["user"]}>
              <Profile />
            </RoleRoute>
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

      {/* USER DASHBOARD */}
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

      {/* USER BOOKINGS */}
      <Route
        path="/user/bookings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["user"]}>
              <MyBookings />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 🔥 BOOKING */}
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

      {/* 🔥 PAYMENT PAGE */}
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["user"]}>
              <PaymentPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 🔥 SUCCESS PAGE */}
      <Route
        path="/booking-success/:bookingId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["user"]}>
              <BookingSuccess />
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

      {/* ✅ ADMIN USERS */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <Users />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN TECHNICIANS */}
      <Route
        path="/admin/technicians"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <Technicians />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN BOOKINGS */}
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <Bookings />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={<h1 className="text-center mt-10">404 Not Found</h1>}
      />

    </Routes>
  );
};

export default AppRoutes;