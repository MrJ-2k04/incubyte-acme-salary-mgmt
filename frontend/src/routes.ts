import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import InsightsOutlined from '@mui/icons-material/InsightsOutlined'

export const ROUTE = { employees: '/', insights: '/insights' } as const

export const NAV_ITEMS = [
  { path: ROUTE.employees, label: 'Employees', icon: GroupsOutlined },
  { path: ROUTE.insights, label: 'Insights', icon: InsightsOutlined },
] as const
