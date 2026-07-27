export type UserRole =
  | 'ROLE_TRAINER'
  | 'ROLE_COUNTY_OFFICER'
  | 'ROLE_NATIONAL_ADMIN'
  | 'ROLE_ME_MANAGER'
  | 'ROLE_SYSTEM_ADMIN'
  | 'ROLE_TRAINEE'

export interface LoginResponse {
  role: UserRole
  county: string
  username: string
  full_name: string
  staff_number?: string | null
}

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  role: UserRole
  county: string
  staff_number?: string | null
  is_active: boolean
}

export interface Participant {
  id: string
  name: string
  staff_number?: string | null
  cadre: string
  facility: string
  status: 'PRESENT' | 'ABSENT'
  pre_test_score?: number | null
  post_test_score?: number | null
  certificate_serial?: string | null
}

export interface SessionTrainer {
  id: string
  name: string
  cadre: string
  phone: string
}

export interface SessionSummary {
  id: string
  title: string
  program_id?: string | null
  program_code?: string | null
  program_name?: string | null
  county: string
  facility: string
  trainee_count: number
  start_date: string
  end_date: string
  status: string
  approval_status: string
  approval_note?: string | null
  approved_by?: string | null
  approved_by_name?: string | null
  report_submitted_at?: string | null
  report_approval_status: string
  report_approved_by?: string | null
  report_approved_by_name?: string | null
  certificates_issued: boolean
}

export interface TrainingSession extends SessionSummary {
  report_summary?: string | null
  report_challenges?: string | null
  report_recommendations?: string | null
  report_approval_note?: string | null
  participants: Participant[]
  trainers: SessionTrainer[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

export interface CertificateVerification {
  valid: boolean
  source?: 'current' | 'legacy'
  era?: 'pre_2018' | 'post_2018'
  participant_name: string
  cadre: string
  facility: string
  course: string
  county: string
  start_date: string
  end_date: string
  post_test_score?: number | null
  issued_date?: string | null
  serial: string
}

export interface AuthState {
  role: UserRole
  county: string
  username: string
  full_name: string
  staff_number?: string | null
}
