  import axios from "axios";

  console.log("api.js", import.meta.env.VITE_API_URL)

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : "http://localhost:5000/api",
  withCredentials: true,
});

// Attach token automatically
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

export default API;