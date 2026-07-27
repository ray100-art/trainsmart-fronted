import { api } from './client'
import type { MoodleInfo } from '@/types'

export async function getMoodleInfo() {
  const { data } = await api.get<MoodleInfo>('/moodle')
  return data
}
