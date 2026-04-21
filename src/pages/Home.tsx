import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import { Link as RouterLink } from 'react-router-dom'
import { games } from '../games/registry'

function HeroSection() {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 3.5, md: 6 },
        borderRadius: 5,
        color: 'white',
        background:
          'linear-gradient(135deg, #6C4BFF 0%, #8B5CF6 40%, #FF4B8B 100%)',
        boxShadow: '0 24px 60px -20px rgba(108,75,255,.55)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.12), transparent 40%)',
          pointerEvents: 'none',
        }}
      />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 3, md: 4 }}
        alignItems={{ md: 'center' }}
        sx={{ position: 'relative' }}
      >
        <Box sx={{ flex: 1 }}>
          <Chip
            label="Play anywhere · No downloads"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,.18)',
              color: 'white',
              mb: 2,
              backdropFilter: 'blur(6px)',
            }}
          />
          <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 56 } }}>
            Bite-size games,
            <br />
            built for the browser.
          </Typography>
          <Typography sx={{ opacity: 0.9, mt: 2, maxWidth: 560 }}>
            A curated arcade of quick, delightful mini games. Sharpen your
            reflexes, test your memory, or take on a clever AI — all in one
            place.
          </Typography>
          <Stack direction="row" spacing={1.5} mt={3} flexWrap="wrap" useFlexGap>
            <Button
              component={RouterLink}
              to={`/games/${games[0].slug}`}
              size="large"
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,.9)' },
              }}
            >
              Play now
            </Button>
            <Button
              component={RouterLink}
              to="/about"
              size="large"
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,.08)',
                },
              }}
            >
              About
            </Button>
          </Stack>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            minWidth: 300,
          }}
        >
          {games.slice(0, 6).map((g, i) => {
            const Icon = g.icon
            return (
              <Box
                key={g.slug}
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(255,255,255,.14)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,.2)',
                  animation: `floatY 3.5s ease-in-out ${i * 0.25}s infinite`,
                }}
              >
                <Icon sx={{ fontSize: 34 }} />
              </Box>
            )
          })}
        </Box>
      </Stack>
    </Paper>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: (t) => `1px solid ${t.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: 'white',
          background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  )
}

export default function Home() {
  return (
    <Stack spacing={4}>
      <HeroSection />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<SportsEsportsIcon />}
            label="Games in the arcade"
            value={`${games.length}`}
            accent="#6C4BFF"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<RocketLaunchIcon />}
            label="Load time"
            value="< 1s"
            accent="#22c55e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<FavoriteRoundedIcon />}
            label="Free, forever"
            value="No sign-up"
            accent="#FF4B8B"
          />
        </Grid>
      </Grid>

      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h4">Pick a game</Typography>
          <Typography color="text.secondary">
            Six handcrafted experiences, one click away.
          </Typography>
        </Box>
        <Chip
          icon={<EmojiEventsIcon />}
          label="Best scores saved locally"
          variant="outlined"
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
      </Stack>

      <Grid container spacing={3}>
        {games.map((g) => {
          const Icon = g.icon
          return (
            <Grid key={g.slug} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: (t) => `1px solid ${t.palette.divider}`,
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (t) =>
                      t.palette.mode === 'dark'
                        ? '0 14px 40px rgba(0,0,0,.45)'
                        : '0 14px 40px rgba(30,30,60,.12)',
                    borderColor: g.accent,
                  },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={`/games/${g.slug}`}
                  sx={{ height: '100%' }}
                >
                  <Box
                    sx={{
                      height: 120,
                      position: 'relative',
                      overflow: 'hidden',
                      background: `linear-gradient(135deg, ${g.accent}, ${g.accent}88)`,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                          'radial-gradient(circle at 30% 20%, rgba(255,255,255,.25), transparent 50%)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 18,
                        top: 18,
                        width: 60,
                        height: 60,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255,255,255,.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'white',
                      }}
                    >
                      <Icon sx={{ fontSize: 32 }} />
                    </Box>
                    <Chip
                      label={g.difficulty}
                      size="small"
                      sx={{
                        position: 'absolute',
                        left: 16,
                        bottom: 14,
                        bgcolor: 'rgba(255,255,255,.22)',
                        color: 'white',
                        fontWeight: 700,
                        backdropFilter: 'blur(6px)',
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6">{g.title}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5, minHeight: 42 }}
                    >
                      {g.description}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {g.tags.map((t) => (
                        <Chip key={t} size="small" label={t} variant="outlined" />
                      ))}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Stack>
  )
}
