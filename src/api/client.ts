import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/setup-password')
    ) {
      localStorage.removeItem('trainsmart_auth')
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/verify') &&
          !window.location.pathname.startsWith('/setup-password')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
