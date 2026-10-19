import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS, ROUTE } from '../routes'

export const SIDEBAR_WIDTH = 248

type Props = { mobile: boolean; open: boolean; onClose: () => void }

export default function Sidebar({ mobile, open, onClose }: Props) {
  return (
    <Box sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: 0 }}>
      <Drawer
        variant={mobile ? 'temporary' : 'permanent'}
        open={mobile ? open : true}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ height: 64, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.contrastText',
              background:
                'linear-gradient(135deg, var(--mui-palette-primary-light) 0%, var(--mui-palette-primary-dark) 100%)',
              boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel) / 0.35)',
            }}
          >
            <PaymentsOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Typography component="h1" sx={{ lineHeight: 1.15 }}>
            <Box component="span" sx={{ display: 'block', fontWeight: 700, letterSpacing: '-0.01em' }}>
              ACME
            </Box>{' '}
            <Box component="span" sx={{ display: 'block', fontSize: 12, color: 'text.secondary' }}>
              Salary Management
            </Box>
          </Typography>
        </Box>

        <Box component="nav" aria-label="Main" sx={{ px: 1.5, py: 2 }}>
          <Typography
            variant="overline"
            sx={{ px: 1.5, color: 'text.disabled', fontWeight: 600, letterSpacing: '0.08em' }}
          >
            Menu
          </Typography>
          <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <ListItemButton
                key={path}
                component={NavLink}
                to={path}
                end={path === ROUTE.employees}
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  color: 'text.secondary',
                  position: 'relative',
                  '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 36 },
                  '&.active': {
                    color: 'primary.main',
                    bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                  },
                  '&.active::before': {
                    content: '""',
                    position: 'absolute',
                    left: -12,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: '0 3px 3px 0',
                    bgcolor: 'primary.main',
                  },
                }}
              >
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label} slotProps={{ primary: { sx: { fontWeight: 600, fontSize: 14 } } }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}
