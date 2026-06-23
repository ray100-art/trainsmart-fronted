import { api } from './client'
import type { Participant } from '@/types'

export async function addParticipant(sessionId: string, payload: {
  name: string
  cadre: string
  facility: string
  status?: string
  staff_number?: string
}) {
  const { data } = await api.post<Participant>(`/sessions/${sessionId}/participants`, payload)
  return data
}

export async function toggleAttendance(sessionId: string, participantId: string) {
  const { data } = await api.patch<Participant>(
    `/sessions/${sessionId}/participants/${participantId}/attendance`,
  )
  return data
}

export async function updateScores(sessionId: string, participantId: string, payload: {
  pre_test_score: number
  post_test_score: number
}) {
  const { data } = await api.patch<Participant>(
    `/sessions/${sessionId}/participants/${participantId}/scores`,
    payload,
  )
  return data
}

export async function removeParticipant(sessionId: string, participantId: string) {
  await api.delete(`/sessions/${sessionId}/participants/${participantId}`)
}
