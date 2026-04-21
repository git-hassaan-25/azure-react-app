import { useState } from 'react'
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import GitHubIcon from '@mui/icons-material/GitHub'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useColorMode } from '../context/ColorModeContext'
import { games } from '../games/registry'

const DRAWER_WIDTH = 280

function BrandMark() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.2}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          background:
            'linear-gradient(135deg, #6C4BFF 0%, #FF4B8B 55%, #f59e0b 100%)',
          boxShadow: '0 6px 18px rgba(108,75,255,.35)',
          color: 'white',
        }}
      >
        <SportsEsportsIcon fontSize="small" />
      </Box>
      <Stack spacing={0}>
        <Typography
          variant="h6"
          sx={{ lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          PlayVerse
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1 }}
        >
          mini games arcade
        </Typography>
      </Stack>
    </Stack>
  )
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const items = [
    { to: '/', label: 'Home', icon: <HomeRoundedIcon /> },
    { to: '/about', label: 'About', icon: <InfoOutlinedIcon /> },
  ]
  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <BrandMark />
      </Box>
      <List sx={{ px: 1.5 }}>
        {items.map((item) => (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              end
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                '&.active': {
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(167,139,250,.16)'
                      : 'rgba(108,75,255,.1)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 3, mt: 2, letterSpacing: 1.2 }}
      >
        Games
      </Typography>
      <List sx={{ px: 1.5, overflowY: 'auto' }} className="scrollbar-thin">
        {games.map((g) => {
          const Icon = g.icon
          return (
            <ListItem key={g.slug} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={`/games/${g.slug}`}
                onClick={onNavigate}
                sx={{
                  borderRadius: 2,
                  '&.active': {
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(167,139,250,.16)'
                        : 'rgba(108,75,255,.1)',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.2,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'white',
                      background: `linear-gradient(135deg, ${g.accent}, ${g.accent}bb)`,
                    }}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={g.title}
                  secondary={g.tagline}
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} PlayVerse · Built with React + MUI
        </Typography>
      </Box>
    </Box>
  )
}

export function Layout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)
  const { mode, toggle } = useColorMode()
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="transparent"
        sx={{
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(11,13,20,0.72)'
              : 'rgba(245,246,251,0.72)',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setOpen(true)}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: { xs: isMobile ? 'flex' : 'none', md: 'none' } }}>
            <BrandMark />
          </Box>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="View source">
            <IconButton
              component="a"
              href="https://github.com/git-hassaan-25/azure-react-app"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton onClick={toggle} aria-label="toggle theme">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{ sx: { width: DRAWER_WIDTH } }}
        >
          <SideNav onNavigate={() => setOpen(false)} />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              borderRight: 'none',
              bgcolor: 'background.paper',
            },
          }}
        >
          <Toolbar />
          <SideNav />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: 0 },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 3, md: 5 }, animation: 'fadeInUp 400ms ease' }}
          key={location.pathname}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
