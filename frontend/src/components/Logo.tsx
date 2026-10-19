import Box from '@mui/material/Box'

const SIZE = 28

// Three rising pay bars cut from a solid tile, with only the tallest one in the brand colour.
export default function Logo() {
  return (
    <Box component="svg" viewBox="0 0 28 28" aria-hidden sx={{ width: SIZE, height: SIZE, flexShrink: 0, display: 'block' }}>
      <Box component="rect" width="28" height="28" rx="7" sx={{ fill: 'var(--mui-palette-text-primary)' }} />
      <Box component="rect" x="7" y="15" width="3.5" height="6" rx="1" sx={{ fill: 'var(--mui-palette-background-paper)' }} />
      <Box component="rect" x="12.25" y="11" width="3.5" height="10" rx="1" sx={{ fill: 'var(--mui-palette-background-paper)' }} />
      <Box component="rect" x="17.5" y="7" width="3.5" height="14" rx="1" sx={{ fill: 'var(--mui-palette-primary-main)' }} />
    </Box>
  )
}
