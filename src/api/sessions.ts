import { api } from './client'
import type { PaginatedResponse, SessionSummary, TrainingSession } from '@/types'

export interface ListSessionsParams {
  county?: string
  q?: string
  approval_status?: string
  status?: string
  funding_source?: string
  skip?: number
  limit?: number
}

export async function listSessions(params: ListSessionsParams = {}) {
  const { skip = 0, limit = 50, county, q, approval_status, status, funding_source } = params
  const { data } = await api.get<PaginatedResponse<SessionSummary>>('/sessions', {
    params: {
      skip,
      limit,
      ...(county ? { county } : {}),
      ...(q ? { q } : {}),
      ...(approval_status ? { approval_status } : {}),
      ...(status ? { status } : {}),
      ...(funding_source ? { funding_source } : {}),
    },
  })
  return data
}

export async function getSession(sessionId: string) {
  const { data } = await api.get<TrainingSession>(`/sessions/${sessionId}`)
  return data
}

export async function createSession(payload: {
  title: string
  program_id?: string
  county: string
  facility: string
  venue?: string
  funding_source?: string
  sponsor_id?: string
  start_date: string
  end_date: string
  status?: string
}) {
  const { data } = await api.post<TrainingSession>('/sessions', payload)
  return data
}

export async function updateSession(sessionId: string, payload: Partial<{
  title: string
  county: string
  facility: string
  venue: string
  funding_source: string
  sponsor_id: string | null
  start_date: string
  end_date: string
  status: string
}>) {
  const { data } = await api.patch<TrainingSession>(`/sessions/${sessionId}`, payload)
  return data
}

export async function deleteSession(sessionId: string) {
  await api.delete(`/sessions/${sessionId}`)
}

export async function approveSession(sessionId: string) {
  const { data } = await api.patch<TrainingSession>(`/sessions/${sessionId}/approve`)
  return data
}

export async function rejectSession(sessionId: string, note: string) {
  const { data } = await api.patch<TrainingSession>(`/sessions/${sessionId}/reject`, { note })
  return data
}

export async function submitReport(sessionId: string, payload: {
  summary: string
  challenges?: string
  recommendations?: string
}) {
  const { data } = await api.patch<TrainingSession>(`/sessions/${sessionId}/report`, payload)
  return data
}

export async function approveReport(sessionId: string) {
  const { data } = await api.patch<TrainingSession>(`/sessions/${sessionId}/report/approve`)
  return data
}

export async function rejectReport(sessionId: string, note: string) {
  const { data } = await api.patch<TrainingSession>(`/sessions/${sessionId}/report/reject`, { note })
  return data
}

export async function completeSession(sessionId: string) {
  const { data } = await api.patch<TrainingSession>(`/sessions/${sessionId}/complete`)
  return data
}
