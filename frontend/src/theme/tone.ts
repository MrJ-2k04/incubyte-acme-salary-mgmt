import { type Theme, alpha, darken, lighten } from '@mui/material/styles'
import { ACTIVE_PALETTE } from './palettes'

export function accentFor(key: string | number): string {
  const seed = typeof key === 'number' ? key : [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return ACTIVE_PALETTE.accents[seed % ACTIVE_PALETTE.accents.length]
}

// Tinted text on a faint fill of the same colour reads well in both modes.
export function softTone(accent: string) {
  return (theme: Theme) => ({
    color: darken(accent, 0.3),
    bgcolor: alpha(accent, 0.12),
    ...theme.applyStyles('dark', { color: lighten(accent, 0.4), bgcolor: alpha(accent, 0.2) }),
  })
}
