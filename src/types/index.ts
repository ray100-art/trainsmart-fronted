export type UserRole =
  | 'ROLE_TRAINER'
  | 'ROLE_SITE_COORDINATOR'
  | 'ROLE_COUNTY_OFFICER'
  | 'ROLE_NATIONAL_ADMIN'
  | 'ROLE_ME_MANAGER'
  | 'ROLE_SYSTEM_ADMIN'
  | 'ROLE_TRAINEE'

export interface LoginResponse {
  mfa_required?: boolean
  mfa_setup_required?: boolean
  mfa_token?: string | null
  role?: UserRole | null
  county?: string | null
  username?: string | null
  full_name?: string | null
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
  mfa_enabled?: boolean
}

export interface Participant {
  id: string
  name: string
  staff_number?: string | null
  person_id?: string | null
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

export interface Person {
  id: string
  national_id: string
  first_name: string
  middle_name?: string | null
  last_name: string
  gender: 'Male' | 'Female' | 'Other'
  qualification: string
  facility: string
  county: string
  phone?: string | null
  email?: string | null
  is_active: boolean
}

export interface Facility {
  id: string
  name: string
  county: string
  mfl_code?: string | null
  facility_type?: string | null
  is_active: boolean
}

export interface Sponsor {
  id: string
  name: string
  code?: string | null
  description?: string | null
  is_active: boolean
}

export interface MoodleInfo {
  enabled: boolean
  url?: string | null
  categories_path?: string | null
  courses_path?: string | null
}

export interface SessionSummary {
  id: string
  title: string
  program_id?: string | null
  program_code?: string | null
  program_name?: string | null
  county: string
  facility: string
  venue?: string | null
  funding_source?: string | null
  sponsor_id?: string | null
  sponsor_name?: string | null
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
  certificates_signed: boolean
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
