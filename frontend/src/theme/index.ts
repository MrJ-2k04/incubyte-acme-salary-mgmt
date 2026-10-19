import { createTheme } from '@mui/material/styles'
import { ACTIVE_PALETTE, type SchemeTokens } from './palettes'

const FONT = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

function schemePalette(tokens: SchemeTokens) {
  return {
    palette: {
      primary: { main: tokens.primary },
      background: { default: tokens.background, paper: tokens.surface },
      text: { primary: tokens.text, secondary: tokens.textMuted },
      divider: tokens.border,
    },
  }
}

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: schemePalette(ACTIVE_PALETTE.light),
    dark: schemePalette(ACTIVE_PALETTE.dark),
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: FONT,
    h1: { fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { fontFeatureSettings: '"cv11", "ss01"', WebkitFontSmoothing: 'antialiased' } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8, paddingInline: 14 } },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          backgroundColor: theme.vars.palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.divider },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
        head: ({ theme }) => ({
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: theme.vars.palette.text.secondary,
          backgroundColor: theme.vars.palette.background.paper,
          whiteSpace: 'nowrap',
        }),
        body: { paddingTop: 12, paddingBottom: 12 },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:last-child td': { borderBottom: 0 },
          '&.MuiTableRow-hover:hover': { backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.05)` },
        }),
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({ borderRadius: 16, border: `1px solid ${theme.vars.palette.divider}` }),
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
})
