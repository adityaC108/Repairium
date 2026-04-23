  import axios from "axios";

  const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true, //
  });

  // ✅ Attach token automatically
  API.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token"); // your key
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

const technicianServices = {

    getProfile: async () => {
        try {
            const response = await API.get('/technicians/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getMe: async () => {
        try {
            const response = await API.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateStatus: async (status) => {
        try {
            const response = await API.put('/technicians/availability', { isOnline: status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getStats: async () => {
        try {
            const response = await API.get('/technicians/statistics');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await API.put('/technicians/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateAvatar: async (formData) => {
        try {
            const response = await API.put('/technicians/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateLocation: async (locationData) => {
        try {
            const response = await API.put('/technicians/location', locationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateBankDetails: async (bankData) => {
        try {
            // Destructuring allows you to pass only the fields you need
            const { accountHolder, accountNumber, bankName, ifscCode } = bankData;

            const response = await API.put('/technicians/bank-details', {
                bankDetails: { accountHolder, accountNumber, bankName, ifscCode }
            });

            return response.data;
        } catch (error) {
            // Extracting a clear error message for the UI
            const errorMessage = error.response?.data?.message || error.message || 'Update failed';
            throw new Error(errorMessage);
        }
    },

    uploadDocument: async (formData) => {
        try {
            const response = await API.post('/technicians/upload-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
            throw new Error(errorMessage);
        }
    },

    getBookings: async (params = {}) => {
        try {
            const response = await API.get('/technicians/bookings', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateBookingStatus: async (bookingId, statusData) => {
        try {
            // statusData: { status, technicianNotes, sparePartsCost, basePrice }
            const response = await API.put(`/technicians/bookings/${bookingId}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    respondToRequest: async (bookingId, response) => {
        try {
            // response: { action: 'accept' | 'reject' }
            const res = await API.post(`/technicians/bookings/${bookingId}/respond`, response);
            return res.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getReviews: async () => {
        try {
            const response = await API.get('/technicians/reviews');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getEarnings: async () => {
        try {
            const response = await API.get('/technicians/earnings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default technicianServices;