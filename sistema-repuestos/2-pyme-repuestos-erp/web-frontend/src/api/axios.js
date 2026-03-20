import axios from 'axios';

// La URL base apunta a /api si usamos el proxy de vite, 
// o a VITE_API_URL desde el .env si está disponible en prod
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;
