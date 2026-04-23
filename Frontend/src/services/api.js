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

  export default API;