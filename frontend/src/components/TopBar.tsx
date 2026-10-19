import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import MenuRounded from '@mui/icons-material/MenuRounded'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ColorModeToggle from './ColorModeToggle'

type Props = { section: string; mobile: boolean; onMenu: () => void }

export default function TopBar({ section, mobile, onMenu }: Props) {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
        bgcolor: 'rgba(var(--mui-palette-background-defaultChannel) / 0.8)',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64 }, px: { xs: 2, md: 4 } }}>
        {mobile && (
          <IconButton aria-label="Open menu" onClick={onMenu} edge="start">
            <MenuRounded />
          </IconButton>
        )}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">Workspace</Typography>
          <ChevronRightRounded fontSize="small" />
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {section}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ ml: 'auto', alignItems: 'center' }}>
          <ColorModeToggle />
          <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}>HR</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                HR Manager
              </Typography>
              <Typography variant="caption" color="text.secondary">
                People team
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
