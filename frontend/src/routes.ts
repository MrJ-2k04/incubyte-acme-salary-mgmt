import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'

export const ROUTE = { dashboard: '/', employees: '/employees' } as const

export const EMPLOYEE_FILTERS = ['q', 'country', 'job_title', 'department'] as const

export const STATUS_PARAM = 'status'

export type EmployeeFilters = Partial<Record<(typeof EMPLOYEE_FILTERS)[number], string>>

export function employeesLink(filters: EmployeeFilters = {}): string {
  const search = new URLSearchParams(filters).toString()
  return search ? `${ROUTE.employees}?${search}` : ROUTE.employees
}

export const NAV_ITEMS = [
  { path: ROUTE.dashboard, label: 'Dashboard', icon: DashboardOutlined },
  { path: ROUTE.employees, label: 'Employees', icon: GroupsOutlined },
] as const
