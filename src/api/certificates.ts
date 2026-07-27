import { api } from './client'
import type { PaginatedResponse, SessionSummary, SessionTrainer, TrainingSession } from '@/types'

export type CertificatePipelineTab = 'all' | 'pending' | 'certified' | 'signed'

export async function listCertificatePipeline(params: {
  tab?: CertificatePipelineTab
  county?: string
  skip?: number
  limit?: number
} = {}) {
  const { tab = 'all', skip = 0, limit = 50, county } = params
  const { data } = await api.get<PaginatedResponse<SessionSummary>>('/certificates/pipeline', {
    params: { tab, skip, limit, ...(county ? { county } : {}) },
  })
  return data
}

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

export async function signCertificates(sessionId: string) {
  const { data } = await api.patch<TrainingSession>(`/certificates/sessions/${sessionId}/sign`)
  return data
}

export async function verifyCertificate(serial: string, era?: 'pre_2018' | 'post_2018') {
  const { data } = await api.get<import('@/types').CertificateVerification>(
    `/certificates/verify/${encodeURIComponent(serial)}`,
    { params: era ? { era } : undefined },
  )
  return data
}
