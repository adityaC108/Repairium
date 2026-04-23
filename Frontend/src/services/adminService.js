import API from './api';

const adminService = {
  // --- TELEMETRY & ANALYTICS ---
  
  /**
   * Fetches high-level dashboard statistics
   * Returns: { users, technicians, bookings, revenue, appliances }
   */
  getDashboardStats: async () => {
    const response = await API.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Fetches analytical reports based on type
   * @param {string} type - 'revenue', 'bookings', or 'users'
   */
  getReports: async (type) => {
    const response = await API.get(`/admin/reports?type=${type}`);
    return response.data;
  },

  // --- IDENTITY & PROFILE ---

  getProfile: async () => {
    const response = await API.get('/admin/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await API.put('/admin/profile', profileData);
    return response.data;
  },
  
  updateAdminAvatar: async (formData) => {
    const response = await API.put('/admin/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // --- USER NODES MANAGEMENT ---

  getAllUsers: async (params) => {
    // params: { page, limit, search, status, sortBy, sortOrder }
    const response = await API.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await API.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, statusData) => {
    // statusData: { isActive, reason }
    const response = await API.put(`/admin/users/${userId}/status`, statusData);
    return response.data;
  },

  // --- TECHNICIAN FLEET MANAGEMENT ---

  getAllTechnicians: async (params) => {
    const response = await API.get('/admin/technicians', { params });
    return response.data;
  },

  getTechnicianById: async (techId) => {
    const response = await API.get(`/admin/technicians/${techId}`);
    return response.data;
  },

  updateTechnicianStatus: async (technicianId, statusData) => {
    // statusData: { isActive, reason }
    const response = await API.put(`/admin/technicians/${technicianId}/status`, statusData);
    return response.data;
  },

  /**
   * Global verification for a technician node
   */
  verifyTechnician: async (technicianId, verificationData) => {
    // verificationData: { verificationStatus, rejectionReason }
    const response = await API.put(`/admin/technicians/${technicianId}/verify`, verificationData);
    return response.data;
  },

  /**
   * Granular Document Audit protocol
   * @param {string} docType - 'aadharCard', 'panCard', 'bankDetails', etc.
   */
  verifyTechnicianDocument: async (technicianId, docType, auditData) => {
    // auditData: { status, reason }
    const response = await API.put(
      `/admin/technicians/${technicianId}/documents/${docType}`, 
      auditData
    );
    return response.data;
  },

  // --- MISSION REGISTRY ---

  getAllBookings: async (params) => {
    // params: { page, limit, status, startDate, endDate }
    const response = await API.get('/admin/bookings', { params });
    return response.data;
  }
};

export default adminService;