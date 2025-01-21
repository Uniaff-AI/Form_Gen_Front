import axios from 'axios';

// Использование переменной окружения для базового URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // для Vite
    headers: {
        'Content-Type': 'application/json'
    }
});


export default api;
