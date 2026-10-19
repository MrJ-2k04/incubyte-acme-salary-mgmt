import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Suspense, lazy } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import EmployeesPage from './pages/EmployeesPage'

// Charts are heavy, so they load only when someone opens insights.
const InsightsPage = lazy(() => import('./pages/InsightsPage'))

const ROUTE = { employees: '/', insights: '/insights' } as const

export default function App() {
  const { pathname } = useLocation()
  const current = pathname === ROUTE.insights ? ROUTE.insights : ROUTE.employees

  return (
    <>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 4 }}>
          <Typography variant="h6" component="h1">
            ACME Salary Management
          </Typography>
          <Tabs value={current}>
            <Tab label="Employees" value={ROUTE.employees} component={Link} to={ROUTE.employees} />
            <Tab label="Insights" value={ROUTE.insights} component={Link} to={ROUTE.insights} />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Suspense>
          <Routes>
            <Route path={ROUTE.employees} element={<EmployeesPage />} />
            <Route path={ROUTE.insights} element={<InsightsPage />} />
          </Routes>
        </Suspense>
      </Container>
    </>
  )
}
