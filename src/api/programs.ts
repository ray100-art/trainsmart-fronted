import { api } from './client'

export interface TrainingProgram {
  id: string
  code: string
  name: string
  description?: string | null
  category: string
  target_cadres?: string | null
  duration_days?: number | null
  is_active: boolean
}

export async function listPrograms(activeOnly = true) {
  const { data } = await api.get<TrainingProgram[]>('/programs', {
    params: { active_only: activeOnly },
  })
  return data
}

export async function createProgram(payload: {
  code: string
  name: string
  description?: string
  category: string
  target_cadres?: string
  duration_days?: number
}) {
  const { data } = await api.post<TrainingProgram>('/programs', payload)
  return data
}

export async function updateProgram(programId: string, payload: Partial<{
  name: string
  description: string
  category: string
  target_cadres: string
  duration_days: number
  is_active: boolean
}>) {
  const { data } = await api.patch<TrainingProgram>(`/programs/${programId}`, payload)
  return data
}

export async function seedPrograms() {
  const { data } = await api.post<{ seeded: number; message: string }>('/programs/seed')
  return data
}
