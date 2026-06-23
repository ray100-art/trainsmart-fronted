import { api } from './client'
import type { TrainingSession } from '@/types'

export async function listSessions(county?: string) {
  const { data } = await api.get<TrainingSession[]>('/sessions', {
    params: county ? { county } : undefined,
  })
  return data
}

export async function getSession(sessionId: string) {
  const { data } = await api.get<TrainingSession>(`/sessions/${sessionId}`)
  return data
}

export async function createSession(payload: {
  title: string
  county: string
  facility: string
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
