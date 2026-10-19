// Mirrors the backend Pydantic schemas. Edit both together.

export type Employee = {
  id: number
  full_name: string
  email: string
  job_title: string
  department: string
  country_code: string
  currency: string
  salary: number
  hired_on: string
  archived_at: string | null
}

export type EmployeeInput = Omit<Employee, 'id' | 'currency' | 'archived_at'>

export type EmployeePage = {
  items: Employee[]
  total: number
  page: number
  size: number
}

export type SortOrder = 'asc' | 'desc'

export const EMPLOYEE_STATUS = { active: 'active', archived: 'archived', all: 'all' } as const

export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS]

export type EmployeeQuery = {
  q?: string
  country?: string
  job_title?: string
  department?: string
  status?: EmployeeStatus
  sort?: keyof Employee
  order?: SortOrder
  page?: number
  size?: number
}

export type CountryOption = { code: string; name: string; currency: string }

export type ReferenceData = {
  countries: CountryOption[]
  departments: string[]
  job_titles: Record<string, string[]>
}

export type CountryInsight = {
  country_code: string
  country_name: string
  currency: string
  headcount: number
  min_salary: number
  max_salary: number
  avg_salary: number
  avg_salary_usd: number
}

export type JobTitleInsight = {
  job_title: string
  headcount: number
  min_salary: number
  max_salary: number
  avg_salary: number
}

export type Summary = {
  headcount: number
  countries: number
  total_payroll_usd: number
  avg_salary_usd: number
}

export type Distribution = {
  currency: string
  buckets: { lower: number; upper: number; count: number }[]
}

export type ImportReport = {
  imported: number
  rejected: { line: number; errors: string[] }[]
}

export type SalaryAdjustment = {
  percent: number
  q?: string
  country?: string
  job_title?: string
  department?: string
}

export type RaisePreview = {
  headcount: number
  payroll_before_usd: number
  payroll_after_usd: number
  sample: { full_name: string; currency: string; salary: number; new_salary: number }[]
}
