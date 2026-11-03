import axios from 'axios'

/**
 * Axios instance configured for ExamSeatX API
 *
 * Base URL: /api (proxied by Vite dev server to http://localhost:8080/api)
 * This means we never need to hardcode the backend URL in our components.
 *
 * In production, set VITE_API_URL env variable.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds (seating generation can take time)
})

// Request interceptor: add auth token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear and redirect to login (when auth is added)
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api
