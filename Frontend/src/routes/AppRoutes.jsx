import { Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ServicesPage from "../pages/ServicesPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";

import ReviewPage from "../pages/ReviewPage";

import BookingPage from "../pages/BookingPage";
import PaymentPage from "../pages/PaymentPage"; // ✅ NEW
import PaymentSuccess from "../pages/PaymentSuccess"; // ✅ NEW

// Dashboards
import UserDashboard from "../pages/user/Dashboard";
import TechnicianDashboard from "../pages/technician/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import Bookings from "../pages/admin/Bookings"

// ✅ ADD THESE HERE
import Users from "../pages/admin/Users";
import Technicians from "../pages/admin/Technicians";
import MyBookings from "../pages/user/MyBookings";
import BookingsPage from "../pages/technician/BookingsPage";

import Profile from "../pages/user/Profile";

// Protection
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import NotFound from "../pages/NotFound";
import BookingProgressPage from "../pages/technician/BookingProgressPage";
import MyBookingsPage from "../pages/technician/MyBookingsPage";
import CompletedBookingsPage from "../pages/technician/CompletedBookingsPage";
import TechnicianReviews from "../pages/technician/TechnicianReviews";

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

      <Route path="/user/reviews/:bookingId/:technicianId" element={<ReviewPage />} />

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
              <PaymentSuccess />
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
      <Route
        path="/technician/bookings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["technician"]}>
              <BookingsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/bookings/:bookingId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["technician"]}>
              <BookingProgressPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/my-bookings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["technician"]}>
              <MyBookingsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/completed-bookings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["technician"]}>
              <CompletedBookingsPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/reviews"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["technician"]}>
              <TechnicianReviews />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/technician/bookings/:bookingId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["technician"]}>
              <BookingProgressPage />
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
        element={<NotFound />}
      />

    </Routes>
  );
};

export default AppRoutes;