import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded'
import MenuRounded from '@mui/icons-material/MenuRounded'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useStartTour } from '../tour/context'

type Props = { section: string; mobile: boolean; onMenu: () => void }

export default function TopBar({ section, mobile, onMenu }: Props) {
  const startTour = useStartTour()

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
        <Button
          color="inherit"
          size="small"
          startIcon={<HelpOutlineRounded />}
          aria-label="Take the product tour"
          onClick={startTour}
          sx={{ ml: 'auto', color: 'text.secondary', borderRadius: 5, px: 1.5 }}
        >
          Tour
        </Button>
      </Toolbar>
    </AppBar>
  )
}
