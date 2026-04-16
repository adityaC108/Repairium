import axios from "axios";

// ✅ Create Axios Instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // your backend base
});

// ✅ Attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ===============================
// 🔥 ADMIN APIs
// ===============================

// ✅ 1. Dashboard Statistics
export const getDashboardStats = async () => {
  const res = await API.get("/admin/dashboard");
  return res.data;
};

// ✅ 2. Users Management
export const getAllUsers = async (params = {}) => {
  const res = await API.get("/admin/users", { params });
  return res.data;
};

export const updateUserStatus = async (userId, data) => {
  const res = await API.put(`/admin/users/${userId}/status`, data);
  return res.data;
};

// ✅ 3. Technicians Management
export const getAllTechnicians = async (params = {}) => {
  const res = await API.get("/admin/technicians", { params });
  return res.data;
};

export const updateTechnicianStatus = async (technicianId, data) => {
  const res = await API.put(`/admin/technicians/${technicianId}/status`, data);
  return res.data;
};

export const verifyTechnician = async (technicianId, data) => {
  const res = await API.put(`/admin/technicians/${technicianId}/verify`, data);
  return res.data;
};

// ✅ 4. Booking Management
export const getAllBookings = async (params = {}) => {
  const res = await API.get("/admin/bookings", { params });
  return res.data;
};

// ===============================
// ✅ Export default (optional)
// ===============================
export default {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllTechnicians,
  updateTechnicianStatus,
  verifyTechnician,
  getAllBookings,
};
