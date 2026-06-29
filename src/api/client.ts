import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('trainsmart_auth')
  if (raw) {
    try {
      const auth = JSON.parse(raw) as { token?: string }
      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`
      }
    } catch {
      localStorage.removeItem('trainsmart_auth')
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('trainsmart_auth')
      const path = window.location.pathname
      if (path !== '/login' && !path.startsWith('/setup-password') && !path.startsWith('/verify')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
