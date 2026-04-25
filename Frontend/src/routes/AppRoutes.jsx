import { Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ChangePassword from "../pages/auth/ChangePassword";

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
import Bookings from "../pages/admin/Bookings"

import AdminLayout from "../components/admin/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Reports from "../pages/admin/Reports";

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
import TechnicianDetail from "../pages/admin/TechnicianDetail";
import UserDetail from "../pages/admin/UserDetail";
import BookingDetail from "../pages/admin/BookingDetail";
import AdminProfile from "../pages/admin/AdminProfile";
import Appliances from "../pages/admin/Appliances";
import AddAppliance from "../pages/admin/AddAppliances";
import ApplianceDetail from "../pages/admin/ApplianceDetail";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ❌ Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={ <Home /> } />
      <Route path="/verify-email" element={ < VerifyEmail /> } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
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
        path="/user/reviews/:bookingId/:technicianId"
        element={ <ProtectedRoute> <ReviewPage /> </ProtectedRoute>}
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

      ✅ ADMIN

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Reports />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <UserDetail />
              </AdminLayout>
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
              <AdminLayout>
                <Technicians />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/technicians/:techId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <TechnicianDetail />
              </AdminLayout>
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
              <AdminLayout>
                <Bookings />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings/:bookingId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <BookingDetail />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      {/* Appliances */}
      <Route
        path="/admin/appliances"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Appliances />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appliances/new"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AddAppliance />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appliances/:applianceId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <ApplianceDetail />
              </AdminLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;