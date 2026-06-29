import { api } from './client'

export interface AuditLogEntry {
  id: string
  action: string
  entity_type: string
  entity_id?: string | null
  detail?: string | null
  user_id?: string | null
  user_name?: string | null
  ip_address?: string | null
  created_at?: string | null
}

export interface AuditLogResponse {
  items: AuditLogEntry[]
  total: number
  limit: number
  offset: number
}

export async function getAuditLogs(params?: {
  limit?: number
  offset?: number
  action?: string
  entity_type?: string
}) {
  const { data } = await api.get<AuditLogResponse>('/audit/logs', { params })
  return data
}
