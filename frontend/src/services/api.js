import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Axios interceptor to handle 401 errors and refresh tokens
// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await api.post('/users/refresh-token', {}, { withCredentials: true });

//         if (refreshResponse.status === 200) {
//           // Retry the original request
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error('Refresh token request failed', refreshError);
//         toast.error('Session expired. Please log in again.');
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
