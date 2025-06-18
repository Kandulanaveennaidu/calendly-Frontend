import axios from 'axios';
import authService from './authService';

// Define the base URL for your API.
// It's good practice to use environment variables for this.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: To add the auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Ensure this is the key you use for storing the token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data || '');
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor: To handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status, response.data);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        console.error('API Response Error:', error.response?.status, error.response?.data, originalRequest);

        // Define publicPaths at a scope accessible by all relevant logic
        const publicPaths = ['/login', '/register', '/book', '/'];

        // Handle 401 Unauthorized errors (e.g., token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark to prevent infinite retry loops

            try {
                // Attempt to refresh the token
                const refreshResponse = await authService.refreshToken();
                if (refreshResponse.token) {
                    localStorage.setItem('token', refreshResponse.token);
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.token}`;
                    return apiClient(originalRequest); // Retry the original request with the new token
                } else {
                    // Refresh token failed, logout user
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login'; // Redirect to login
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // For other errors, just pass them along
        return Promise.reject(error);
    }
);

export default apiClient;
