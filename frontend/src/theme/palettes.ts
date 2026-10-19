export type SchemeTokens = {
  primary: string
  background: string
  surface: string
  border: string
  text: string
  textMuted: string
}

export type Palette = {
  light: SchemeTokens
  dark: SchemeTokens
  // Avatars and badges pick one of these by a stable key, so the same person keeps the same colour.
  accents: string[]
}

const NEUTRAL_LIGHT = {
  background: '#f7f7f8',
  surface: '#ffffff',
  border: '#e6e6e9',
  text: '#1a1a1d',
  textMuted: '#6e6e76',
}

// Charcoal rather than black keeps dark mode soft on the eyes.
const NEUTRAL_DARK = {
  background: '#1c1c1f',
  surface: '#252529',
  border: '#36363c',
  text: '#ececee',
  textMuted: '#a1a1a9',
}

const ACCENTS = ['#14b8a6', '#0ea5e9', '#f59e0b', '#f43f5e', '#84cc16', '#f97316', '#3b82f6', '#10b981']

export const PALETTES = {
  lagoon: {
    light: { ...NEUTRAL_LIGHT, primary: '#0f766e' },
    dark: { ...NEUTRAL_DARK, primary: '#5ec4b6' },
    accents: ACCENTS,
  },
  cobalt: {
    light: { ...NEUTRAL_LIGHT, primary: '#1d4ed8' },
    dark: { ...NEUTRAL_DARK, primary: '#7aa2ff' },
    accents: ACCENTS,
  },
  graphite: {
    light: { ...NEUTRAL_LIGHT, primary: '#27272a' },
    dark: { ...NEUTRAL_DARK, primary: '#e4e4e7' },
    accents: ACCENTS,
  },
} satisfies Record<string, Palette>

// Change this one line to restyle the whole app.
export const ACTIVE_PALETTE: Palette = PALETTES.lagoon
