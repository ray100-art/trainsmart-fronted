import { api } from './client'

export interface OverviewStats {
  total_sessions: number
  approved_sessions: number
  completed_sessions: number
  in_progress_sessions: number
  certificates_issued_sessions: number
  pending_session_approvals: number
  rejected_sessions: number
  pending_report_approvals: number
  rejected_reports: number
  ready_for_certificates: number
  reports_due: number
  total_participants: number
  certified_participants: number
  present_participants: number
  sessions_by_county: Record<string, number>
}

export interface AnalyticsStats extends OverviewStats {
  participants_by_cadre: Record<string, number>
  sessions_by_status: Record<string, number>
  sessions_by_approval: Record<string, number>
}

export async function getOverviewStats(county?: string) {
  const { data } = await api.get<OverviewStats>('/stats/overview', {
    params: county ? { county } : undefined,
  })
  return data
}

export async function getAnalyticsStats(county?: string) {
  const { data } = await api.get<AnalyticsStats>('/stats/analytics', {
    params: county ? { county } : undefined,
  })
  return data
}

export function getSessionsExportUrl(county?: string) {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
  const params = county ? `?county=${encodeURIComponent(county)}` : ''
  return `${base}/stats/export/sessions.csv${params}`
}

export async function downloadSessionsExport(county?: string) {
  const { data } = await api.get<Blob>('/stats/export/sessions.csv', {
    params: county ? { county } : undefined,
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `trainsmart-sessions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadParticipantsExport(county?: string) {
  const { data } = await api.get<Blob>('/stats/export/participants.csv', {
    params: county ? { county } : undefined,
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `trainsmart-participants-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
