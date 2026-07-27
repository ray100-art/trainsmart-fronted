import { api } from './client'
import type { Facility, PaginatedResponse, Sponsor } from '@/types'

export async function listFacilities(params: {
  county?: string
  q?: string
  active_only?: boolean
  skip?: number
  limit?: number
} = {}) {
  const { data } = await api.get<PaginatedResponse<Facility>>('/facilities', { params })
  return data
}

export async function createFacility(payload: {
  name: string
  county: string
  mfl_code?: string
  facility_type?: string
}) {
  const { data } = await api.post<Facility>('/facilities', payload)
  return data
}

export async function updateFacility(facilityId: string, payload: Partial<{
  name: string
  county: string
  mfl_code: string | null
  facility_type: string | null
  is_active: boolean
}>) {
  const { data } = await api.patch<Facility>(`/facilities/${facilityId}`, payload)
  return data
}

export async function listSponsors(params: {
  active_only?: boolean
  skip?: number
  limit?: number
} = {}) {
  const { data } = await api.get<PaginatedResponse<Sponsor>>('/sponsors', { params })
  return data
}

export async function createSponsor(payload: {
  name: string
  code?: string
  description?: string
}) {
  const { data } = await api.post<Sponsor>('/sponsors', payload)
  return data
}

export async function updateSponsor(sponsorId: string, payload: Partial<{
  name: string
  code: string | null
  description: string | null
  is_active: boolean
}>) {
  const { data } = await api.patch<Sponsor>(`/sponsors/${sponsorId}`, payload)
  return data
}
