import API from './api';

// Booking service for handling booking operations
export const bookingService = {
  // Accept a booking (technician)
  acceptBooking: async (bookingId) => {
    try {
      const response = await API.post(`/bookings/technician/bookings/${bookingId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting booking:', error);
      throw error.response?.data || { success: false, message: 'Failed to accept booking' };
    }
  },

  // Reject a booking (technician)
  rejectBooking: async (bookingId) => {
    try {
      const response = await API.post(`/bookings/technician/bookings/${bookingId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting booking:', error);
      throw error.response?.data || { success: false, message: 'Failed to reject booking' };
    }
  },

  // Cancel a booking (user)
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await API.delete(`/bookings/user/bookings/${bookingId}`, { data: { reason } });
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error.response?.data || { success: false, message: 'Failed to cancel booking' };
    }
  },

  // Get booking details
  getBookingDetailsForAdmin: async (bookingId) => {
    try {
      const response = await API.get(`/bookings/admin/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting booking details:', error);
      throw error.response?.data || { success: false, message: 'Failed to get booking details' };
    }
  },

  // Get available bookings for technician
  getAvailableBookings: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await API.get(`/bookings/technician/available-bookings?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting available bookings:', error);
      throw error.response?.data || { success: false, message: 'Failed to get available bookings' };
    }
  },

  // Get user bookings
  getUserBookings: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await API.get(`/bookings/user/bookings?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error.response?.data || { success: false, message: 'Failed to get user bookings' };
    }
  },

  // Create a new booking (user)
  createBooking: async (bookingData) => {
    try {
      const response = await API.post('/bookings/user/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error.response?.data || { success: false, message: 'Failed to create booking' };
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await API.patch(`/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error.response?.data || { success: false, message: 'Failed to update booking status' };
    }
  }
};

export default bookingService;