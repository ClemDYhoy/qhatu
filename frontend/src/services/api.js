import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
baseURL: API_BASE_URL,
timeout: 10000,
headers: {
    'Content-Type': 'application/json',
},
});

api.interceptors.request.use(
(config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
},
(error) => Promise.reject(error)
);

api.interceptors.response.use(
(response) => response,
(error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
}
);

export default api;