import ExploreOutlined from '@mui/icons-material/ExploreOutlined'
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useStartTour } from '../tour/context'
import { TOUR_TARGET } from '../tour/steps'
import ThemeModeSwitch from './ThemeModeSwitch'

// The app has no sign-in yet, so the sidebar shows the one person it is built for.
const USER = { name: 'HR Manager', email: 'hr@acmecorp.com', initials: 'HR' }

export default function AccountMenu() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const startTour = useStartTour()

  return (
    <>
      <Stack
        direction="row"
        spacing={1.25}
        data-tour={TOUR_TARGET.account}
        sx={{ alignItems: 'center', p: 1, borderRadius: 2 }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main' }}>
          {USER.initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {USER.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {USER.email}
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          onClick={(event) => setAnchor(event.currentTarget)}
          sx={{ border: 1, borderColor: 'divider', borderRadius: '50%' }}
        >
          <MoreHorizRounded fontSize="small" />
        </IconButton>
      </Stack>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 248, mt: -1, borderRadius: 3, border: 1, borderColor: 'divider' } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {USER.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {USER.email}
          </Typography>
        </Box>
        <Divider />
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="body2">Theme</Typography>
          <ThemeModeSwitch />
        </Stack>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null)
            startTour()
          }}
          sx={{ fontSize: 14 }}
        >
          <ListItemIcon>
            <ExploreOutlined fontSize="small" />
          </ListItemIcon>
          Take the product tour
        </MenuItem>
      </Menu>
    </>
  )
}
