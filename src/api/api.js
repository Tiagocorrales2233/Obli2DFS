import axios from 'axios';

const api = axios.create({
    baseURL: 'https://obligatorio-dfs-1.vercel.app/'
});

export default api;
