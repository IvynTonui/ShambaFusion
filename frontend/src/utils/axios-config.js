import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log("Token from localStorage:", token);  // Debugging
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Authorization Header Set:", config.headers.Authorization); // Debugging
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;