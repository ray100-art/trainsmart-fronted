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

export interface BulkImportResult {
  imported: number
  errors: { row: number; message: string }[]
}

export async function importParticipantsCsv(sessionId: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<BulkImportResult>(
    `/sessions/${sessionId}/participants/import`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function downloadParticipantTemplate(sessionId: string) {
  const { data } = await api.get<Blob>(`/sessions/${sessionId}/participants/import/template.csv`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'participants-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}
