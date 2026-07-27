import { api } from './client'
import type { PaginatedResponse, Person } from '@/types'

export async function listPeople(params: {
  q?: string
  county?: string
  skip?: number
  limit?: number
} = {}) {
  const { data } = await api.get<PaginatedResponse<Person>>('/people', { params })
  return data
}

export async function getPerson(personId: string) {
  const { data } = await api.get<Person>(`/people/${personId}`)
  return data
}

export async function createPerson(payload: {
  national_id: string
  first_name: string
  middle_name?: string
  last_name: string
  gender: 'Male' | 'Female' | 'Other'
  qualification: string
  facility: string
  county: string
  phone?: string
  email?: string
}) {
  const { data } = await api.post<Person>('/people', payload)
  return data
}

export async function updatePerson(personId: string, payload: Partial<{
  first_name: string
  middle_name: string | null
  last_name: string
  gender: 'Male' | 'Female' | 'Other'
  qualification: string
  facility: string
  county: string
  phone: string | null
  email: string | null
  is_active: boolean
}>) {
  const { data } = await api.patch<Person>(`/people/${personId}`, payload)
  return data
}
