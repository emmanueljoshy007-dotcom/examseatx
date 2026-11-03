import axios from 'axios'

// Points to the live ExamSeatX Backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://examseatx.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export default api
