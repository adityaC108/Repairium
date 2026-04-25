import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

import AdminLayout from "../components/admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
// COMMON PAGES
const Home = lazy(() => import( "../pages/Home"))
const Login = lazy(() => import( "../pages/auth/Login"))
const Register = lazy(() => import( "../pages/auth/Register"))
const VerifyEmail = lazy(() => import( "../pages/auth/VerifyEmail"))
const ForgotPassword = lazy(() => import( "../pages/auth/ForgotPassword"))
const ResetPassword = lazy(() => import( "../pages/auth/ResetPassword"))
const ChangePassword = lazy(() => import( "../pages/auth/ChangePassword"))
const ServicesPage = lazy(() => import( "../pages/ServicesPage"))
const AboutPage = lazy(() => import( "../pages/AboutPage"))
const ContactPage = lazy(() => import( "../pages/ContactPage"))
const NotFound = lazy(() => import( "../pages/NotFound"))

// USER PAGES
const ReviewPage = lazy(() => import( "../pages/ReviewPage"))
const BookingPage = lazy(() => import( "../pages/BookingPage"))
const PaymentPage = lazy(() => import( "../pages/PaymentPage"))
const PaymentSuccess = lazy(() => import( "../pages/PaymentSuccess")) 
const UserDashboard = lazy(() => import( "../pages/user/Dashboard"))
const Profile = lazy(() => import( "../pages/user/Profile"))
const MyBookings = lazy(() => import( "../pages/user/MyBookings"))

// TECHNICIAN PAGES
const TechnicianDashboard = lazy(() => import( "../pages/technician/Dashboard"))
const BookingsPage = lazy(() => import( "../pages/technician/BookingsPage"))
const BookingProgressPage = lazy(() => import( "../pages/technician/BookingProgressPage"))
const MyBookingsPage = lazy(() => import( "../pages/technician/MyBookingsPage"))
const TechnicianReviews = lazy(() => import( "../pages/technician/TechnicianReviews"))
const CompletedBookingsPage = lazy(() => import( "../pages/technician/CompletedBookingsPage"))

// ADMIN PAGES
const Bookings = lazy(() => import( "../pages/admin/Bookings"))
const Dashboard = lazy(() => import( "../pages/admin/Dashboard"))
const Reports = lazy(() => import( "../pages/admin/Reports"))
const Users = lazy(() => import( "../pages/admin/Users"))
const Technicians = lazy(() => import( "../pages/admin/Technicians"))
const TechnicianDetail = lazy(() => import( "../pages/admin/TechnicianDetail"))
const UserDetail = lazy(() => import( "../pages/admin/UserDetail"))
const BookingDetail = lazy(() => import( "../pages/admin/BookingDetail"))
const AdminProfile = lazy(() => import( "../pages/admin/AdminProfile"))
const Appliances = lazy(() => import( "../pages/admin/Appliances"))
const AddAppliance = lazy(() => import( "../pages/admin/AddAppliances"))
const ApplianceDetail = lazy(() => import( "../pages/admin/ApplianceDetail"))

const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
    <Loader2 className="text-indigo-500 animate-spin mb-4" size={40} />
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Initializing_Module...</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
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
    </Suspense>
  );
};

export default AppRoutes;