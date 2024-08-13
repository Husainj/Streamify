// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accesstoken'); // Get the access token from local storage
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`; // Add the token to the headers
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default api;
