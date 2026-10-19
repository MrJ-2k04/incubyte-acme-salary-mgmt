import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Suspense, lazy, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import EmployeesPage from './pages/EmployeesPage'
import { NAV_ITEMS, ROUTE } from './routes'
import ProductTour from './tour/ProductTour'

// Charts are heavy, so they load apart from the rest of the app.
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

export default function App() {
  const { pathname } = useLocation()
  const mobile = useMediaQuery(useTheme().breakpoints.down('md'))
  const [menuOpen, setMenuOpen] = useState(false)
  const section = NAV_ITEMS.find((item) => item.path === pathname)?.label ?? NAV_ITEMS[0].label

  return (
    <ProductTour>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar mobile={mobile} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar section={section} mobile={mobile} onMenu={() => setMenuOpen(true)} />
          <Box
            component="main"
            sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, width: '100%', maxWidth: 1600, mx: 'auto' }}
          >
            <Suspense>
              <Routes>
                <Route path={ROUTE.dashboard} element={<DashboardPage />} />
                <Route path={ROUTE.employees} element={<EmployeesPage />} />
              </Routes>
            </Suspense>
          </Box>
          <Footer />
        </Box>
      </Box>
    </ProductTour>
  )
}
