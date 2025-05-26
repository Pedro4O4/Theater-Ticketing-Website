import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true // For cookies/authentication
});

// Add request interceptor for auth tokens if needed
api.interceptors.request.use(config => {
    // You can add auth headers here if needed
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        // Handle common errors (401, 403, etc.)
        return Promise.reject(error);
    }
);

export default api;