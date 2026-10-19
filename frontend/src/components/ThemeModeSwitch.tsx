import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'
import DesktopWindowsOutlined from '@mui/icons-material/DesktopWindowsOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import { useColorScheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'

const MODES = [
  { mode: 'light', label: 'Light', icon: LightModeOutlined },
  { mode: 'dark', label: 'Dark', icon: DarkModeOutlined },
  { mode: 'system', label: 'System', icon: DesktopWindowsOutlined },
] as const

type Mode = (typeof MODES)[number]['mode']

export default function ThemeModeSwitch() {
  const { mode, setMode } = useColorScheme()

  return (
    <ToggleButtonGroup
      aria-label="Theme"
      exclusive
      size="small"
      value={mode ?? 'system'}
      onChange={(_, next: Mode | null) => next && setMode(next)}
      sx={{
        p: 0.25,
        gap: 0.25,
        borderRadius: 5,
        bgcolor: 'action.hover',
        '& .MuiToggleButton-root': {
          border: 0,
          borderRadius: '50% !important',
          p: 0.5,
          color: 'text.secondary',
        },
        '& .MuiToggleButton-root.Mui-selected': {
          color: 'text.primary',
          bgcolor: 'background.paper',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.12)',
        },
      }}
    >
      {MODES.map(({ mode: value, label, icon: Icon }) => (
        <Tooltip key={value} title={label}>
          <ToggleButton value={value} aria-label={label}>
            <Icon sx={{ fontSize: 16 }} />
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  )
}
