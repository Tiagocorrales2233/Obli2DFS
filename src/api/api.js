import axios from 'axios';
import { isTokenValido } from '../utils/auth';

const api = axios.create({
    baseURL: 'https://obligatorio-dfs-1.vercel.app/'
});

// Interceptor de request para agregar token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (isTokenValido(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
