import {
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import PaletteIcon from '@mui/icons-material/Palette'
import BoltIcon from '@mui/icons-material/Bolt'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import DevicesIcon from '@mui/icons-material/Devices'
import ShieldIcon from '@mui/icons-material/Shield'

const FEATURES = [
  {
    icon: <BoltIcon />,
    title: 'Fast by default',
    desc: 'Built with Vite and React 19. Code-splitting and lazy loading keep every screen instant.',
    color: '#f59e0b',
  },
  {
    icon: <PaletteIcon />,
    title: 'Beautiful UI',
    desc: 'Material UI components, a custom gradient palette, and thoughtful micro-interactions throughout.',
    color: '#6C4BFF',
  },
  {
    icon: <DevicesIcon />,
    title: 'Responsive',
    desc: 'Designed mobile-first. Looks great from phones to ultra-wide displays.',
    color: '#22c55e',
  },
  {
    icon: <AccessibilityNewIcon />,
    title: 'Accessible',
    desc: 'Keyboard-friendly controls, ARIA labels, and high-contrast focus states.',
    color: '#06b6d4',
  },
  {
    icon: <ShieldIcon />,
    title: 'Private',
    desc: 'Scores are saved only in your browser. Nothing ever leaves your device.',
    color: '#FF4B8B',
  },
  {
    icon: <CodeIcon />,
    title: 'Open source',
    desc: 'Written in TypeScript with a clean, modular architecture you can extend.',
    color: '#ef4444',
  },
]

const STACK = [
  'React 19',
  'TypeScript',
  'Vite',
  'Material UI 7',
  'React Router',
  'Emotion',
  'ESLint',
]

export default function About() {
  return (
    <Stack spacing={4}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, md: 6 },
          borderRadius: 5,
          border: (t) => `1px solid ${t.palette.divider}`,
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(108,75,255,.18), transparent 60%)'
              : 'linear-gradient(135deg, rgba(108,75,255,.10), transparent 60%)',
        }}
      >
        <Chip label="About PlayVerse" color="primary" sx={{ mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          A delightful little arcade,
          <br />
          crafted with care.
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
          PlayVerse brings together many games we have in a single page
          application. It’s a demo of modern frontend craftsmanship: state
          management patterns, custom hooks, theming, accessibility, and
          snappy animations — all under the hood of something genuinely fun
          to use.
        </Typography>
      </Paper>

      <Box>
        <Typography variant="h5" gutterBottom>
          What makes it production-grade
        </Typography>
        <Grid container spacing={2.5}>
          {FEATURES.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${f.color}22`,
                    color: f.color,
                    mb: 2,
                  }}
                >
                  {f.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {f.title}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>
          Tech stack
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {STACK.map((t) => (
            <Chip key={t} label={t} variant="outlined" sx={{ fontWeight: 600 }} />
          ))}
        </Stack>
      </Box>
    </Stack>
  )
}
