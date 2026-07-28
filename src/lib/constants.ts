export const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
] as const

export const SESSION_STATUSES = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'] as const
export const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const

export const ROLE_LABELS: Record<string, string> = {
  ROLE_TRAINER: 'Field Trainer',
  ROLE_SITE_COORDINATOR: 'Site Coordinator',
  ROLE_COUNTY_OFFICER: 'County Training Officer',
  ROLE_NATIONAL_ADMIN: 'National Administrator',
  ROLE_ME_MANAGER: 'M&E Manager',
  ROLE_TRAINEE: 'Healthcare Worker / Trainee',
  ROLE_SYSTEM_ADMIN: 'System Administrator',
}

export const CADRE_OPTIONS = [
  'Nurse', 'Clinical Officer', 'Doctor', 'Lab Technologist',
  'Pharmacist', 'Community Health Worker', 'Counsellor', 'Other',
]
