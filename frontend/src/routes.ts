import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'

export const ROUTE = { dashboard: '/', employees: '/employees' } as const

export const NAV_ITEMS = [
  { path: ROUTE.dashboard, label: 'Dashboard', icon: DashboardOutlined },
  { path: ROUTE.employees, label: 'Employees', icon: GroupsOutlined },
] as const
