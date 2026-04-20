import API from './api';

const reviewService = {
  // Public Statistics
  getStats: async (period = 'all') => {
    const response = await API.get(`/reviews/statistics?period=${period}`);
    return response.data;
  },

  // User Actions
  getMyReviews: async (page = 1, limit = 10) => {
    const response = await API.get(`/reviews/user/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  postReview: async (reviewData) => {
    // reviewData: { bookingId, technicianId, score, review }
    const response = await API.post('/reviews/user/reviews', reviewData);
    return response.data;
  },

  updateMyReview: async (reviewId, updates) => {
    const response = await API.put(`/reviews/user/reviews/${reviewId}`, updates);
    return response.data;
  },

  // Technician Actions
  getTechReviews: async (params) => {
    const response = await API.get('/reviews/technician/reviews', { params });
    return response.data;
  },

  respondToReview: async (reviewId, responseText) => {
    const response = await API.post(`/reviews/technician/reviews/${reviewId}/respond`, { 
        response: responseText 
    });
    return response.data;
  },

  // Admin Actions
  moderateReview: async (reviewId, status, reason) => {
    const response = await API.put(`/reviews/admin/reviews/${reviewId}/status`, { 
        status, 
        reason 
    });
    return response.data;
  }
};

export default reviewService;