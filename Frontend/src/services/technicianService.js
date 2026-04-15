import axios from 'axios';

// Create an instance for shared configuration
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    withCredentials: true, // Required for cookie-based auth
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Technician Service Layer
 */
const technicianServices = {

    /**
     * Fetch full profile data
     * Used for the main dashboard view
     */
    getProfile: async () => {
        try {
            const response = await API.get('/technicians/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Fetch core user info (fallback or lightweight check)
     */
    getMe: async () => {
        try {
            const response = await API.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Toggle online/offline status
     * @param {boolean} status 
     */
    updateStatus: async (status) => {
        try {
            const response = await API.put('/technicians/availability', { isOnline: status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get technician statistics
     */
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
    }


};

export default technicianServices;