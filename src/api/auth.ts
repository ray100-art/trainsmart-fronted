import { api } from './client'
import type { LoginResponse, PaginatedResponse, User } from '@/types'

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password })
  return data
}

export async function logout() {
  const { data } = await api.post<{ message: string }>('/auth/logout')
  return data
}

export async function setupPassword(token: string, new_password: string) {
  const { data } = await api.post<LoginResponse>('/auth/setup-password', { token, new_password })
  return data
}

export async function getMe() {
  const { data } = await api.get<User>('/auth/me')
  return data
}

export async function changePassword(current_password: string, new_password: string) {
  const { data } = await api.post<{ message: string }>('/auth/change-password', {
    current_password,
    new_password,
  })
  return data
}

export async function registerUser(payload: {
  username: string
  email: string
  password: string
  full_name: string
  role: string
  county: string
  staff_number?: string
}) {
  const { data } = await api.post<User>('/auth/register', payload)
  return data
}

export async function listUsers(skip = 0, limit = 50) {
  const { data } = await api.get<PaginatedResponse<User>>('/auth/users', {
    params: { skip, limit },
  })
  return data
}

export async function deactivateUser(userId: string) {
  const { data } = await api.patch<User>(`/auth/users/${userId}/deactivate`)
  return data
}

export async function activateUser(userId: string) {
  const { data } = await api.patch<User>(`/auth/users/${userId}/activate`)
  return data
}
