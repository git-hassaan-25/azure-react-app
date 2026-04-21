import { createTheme, type ThemeOptions } from '@mui/material/styles'

const sharedComponents: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 12,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        transition:
          'transform 250ms cubic-bezier(.2,.8,.2,1), box-shadow 250ms',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: { borderRadius: 16 },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backdropFilter: 'saturate(180%) blur(14px)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 600 },
    },
  },
}

const sharedShape = { borderRadius: 14 }

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily:
    '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  h1: { fontWeight: 800, letterSpacing: '-0.04em' },
  h2: { fontWeight: 800, letterSpacing: '-0.03em' },
  h3: { fontWeight: 700, letterSpacing: '-0.02em' },
  h4: { fontWeight: 700 },
  h5: { fontWeight: 700 },
  h6: { fontWeight: 700 },
  button: { fontWeight: 600 },
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6C4BFF' },
    secondary: { main: '#FF4B8B' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: {
      default: '#F5F6FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
  },
  shape: sharedShape,
  typography: sharedTypography,
  components: sharedComponents,
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#A78BFA' },
    secondary: { main: '#F472B6' },
    success: { main: '#4ade80' },
    warning: { main: '#fbbf24' },
    error: { main: '#f87171' },
    background: {
      default: '#0B0D14',
      paper: '#131726',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
  },
  shape: sharedShape,
  typography: sharedTypography,
  components: sharedComponents,
})
