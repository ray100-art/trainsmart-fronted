import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

/** Cross-origin SPAs cannot read the CSRF cookie; capture token from response header. */
let csrfToken: string | null = null

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

function currentCsrf(): string | null {
  return csrfToken || readCookie('trainsmart_csrf')
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (method !== 'get' && method !== 'head' && method !== 'options') {
    const csrf = currentCsrf()
    if (csrf) {
      config.headers.set('X-CSRF-Token', csrf)
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    const next = res.headers['x-csrf-token']
    if (typeof next === 'string' && next) {
      csrfToken = next
    }
    return res
  },
  (error) => {
    const next = error.response?.headers?.['x-csrf-token']
    if (typeof next === 'string' && next) {
      csrfToken = next
    }
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/setup-password')
    ) {
      localStorage.removeItem('trainsmart_auth')
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/verify') &&
          !window.location.pathname.startsWith('/setup-password') &&
          !window.location.pathname.startsWith('/forgot-password')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
