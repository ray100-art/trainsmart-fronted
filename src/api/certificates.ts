import { api } from './client'
import type { SessionTrainer, TrainingSession } from '@/types'

export async function addTrainer(sessionId: string, payload: {
  name: string
  cadre: string
  phone: string
}) {
  const { data } = await api.post<SessionTrainer>(`/sessions/${sessionId}/trainers`, payload)
  return data
}

export async function removeTrainer(sessionId: string, trainerId: string) {
  await api.delete(`/sessions/${sessionId}/trainers/${trainerId}`)
}

export async function issueCertificates(sessionId: string) {
  const { data } = await api.patch<TrainingSession>(`/certificates/sessions/${sessionId}/issue`)
  return data
}

export async function verifyCertificate(serial: string) {
  const { data } = await api.get<import('@/types').CertificateVerification>(`/certificates/verify/${serial}`)
  return data
}
