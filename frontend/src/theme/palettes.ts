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

export const PALETTES = {
  indigo: {
    light: {
      primary: '#4f46e5',
      background: '#fafafa',
      surface: '#ffffff',
      border: '#e4e4e7',
      text: '#18181b',
      textMuted: '#71717a',
    },
    dark: {
      primary: '#818cf8',
      background: '#09090b',
      surface: '#111113',
      border: '#27272a',
      text: '#fafafa',
      textMuted: '#a1a1aa',
    },
    accents: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16'],
  },
} satisfies Record<string, Palette>

// Change this one line to restyle the whole app.
export const ACTIVE_PALETTE: Palette = PALETTES.indigo
