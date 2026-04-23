import API from './api';

const applianceService = {
  // --- PUBLIC ACCESS NODES ---

  /**
   * Fetch all appliances with optional query parameters (filters, pagination)
   */
  getAllAppliances: async (params) => {
    const response = await API.get('/appliances', { params });
    return response.data;
  },

  /**
   * Search registry for specific appliance keywords
   */
  searchAppliances: async (query) => {
    const response = await API.get('/appliances/search', { params: { q: query } });
    return response.data;
  },

  /**
   * Retrieve unique categories, brands, and models for filter HUDs
   */
  getCategories: async () => {
    const response = await API.get('/appliances/categories');
    return response.data;
  },

  getBrands: async () => {
    const response = await API.get('/appliances/brands');
    return response.data;
  },

  getModels: async () => {
    const response = await API.get('/appliances/models');
    return response.data;
  },

  getFeatured: async () => {
    const response = await API.get('/appliances/featured');
    return response.data;
  },

  getPopular: async () => {
    const response = await API.get('/appliances/popular');
    return response.data;
  },

  getApplianceById: async (id) => {
    const response = await API.get(`/appliances/${id}`);
    return response.data;
  },

  // --- ADMIN RESTRICTED NODES ---

  /**
   * Create new appliance node (Handles Image Multipart)
   * @param {FormData} formData 
   */
  createAppliance: async (formData) => {
    const response = await API.post('/appliances', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Update existing appliance node (Handles Image Multipart)
   */
  updateAppliance: async (id, formData) => {
    const response = await API.put(`/appliances/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteAppliance: async (id) => {
    const response = await API.delete(`/appliances/${id}`);
    return response.data;
  },

  /**
   * Toggle Active/Inactive status
   */
  updateStatus: async (id, status) => {
    const response = await API.put(`/appliances/${id}/status`, { status });
    return response.data;
  },

  /**
   * Toggle Featured flag
   */
  updateFeatured: async (id, isFeatured) => {
    const response = await API.put(`/appliances/${id}/featured`, { isFeatured });
    return response.data;
  },

  /**
   * Fetch aggregate data for the Admin Dashboard
   */
  getStatistics: async () => {
    const response = await API.get('/appliances/statistics/overview');
    return response.data;
  }
};

export default applianceService;