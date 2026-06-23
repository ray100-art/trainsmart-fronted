export type UserRole =
  | 'ROLE_TRAINER'
  | 'ROLE_COUNTY_OFFICER'
  | 'ROLE_NATIONAL_ADMIN'
  | 'ROLE_ME_MANAGER'
  | 'ROLE_SYSTEM_ADMIN'
  | 'ROLE_TRAINEE'

export interface LoginResponse {
  token?: string
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

export interface TrainingSession {
  id: string
  title: string
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
  report_summary?: string | null
  report_challenges?: string | null
  report_recommendations?: string | null
  report_submitted_at?: string | null
  report_approval_status: string
  report_approval_note?: string | null
  certificates_issued: boolean
  participants: Participant[]
  trainers: SessionTrainer[]
}

export interface CertificateVerification {
  valid: boolean
  participant_name: string
  cadre: string
  facility: string
  course: string
  county: string
  start_date: string
  end_date: string
  post_test_score?: number | null
  serial: string
}

export interface AuthState {
  role: UserRole
  county: string
  username: string
  full_name: string
  staff_number?: string | null
}
