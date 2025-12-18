import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL
});

// Add token to all requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

export default api;