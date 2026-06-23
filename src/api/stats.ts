import { api } from './client'

export interface OverviewStats {
  total_sessions: number
  approved_sessions: number
  completed_sessions: number
  certificates_issued_sessions: number
  pending_session_approvals: number
  pending_report_approvals: number
  ready_for_certificates: number
  total_participants: number
  certified_participants: number
  sessions_by_county: Record<string, number>
}

export async function getOverviewStats(county?: string) {
  const { data } = await api.get<OverviewStats>('/stats/overview', {
    params: county ? { county } : undefined,
  })
  return data
}
