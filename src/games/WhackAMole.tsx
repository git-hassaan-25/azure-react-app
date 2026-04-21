import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Difficulty = 'easy' | 'medium' | 'hard'

const CONFIG: Record<
  Difficulty,
  { interval: number; duration: number; label: string }
> = {
  easy: { interval: 900, duration: 30, label: '30s · slow' },
  medium: { interval: 650, duration: 30, label: '30s · normal' },
  hard: { interval: 430, duration: 30, label: '30s · fast' },
}

const GRID = 9

export default function WhackAMole() {
  const meta = gameBySlug('whack-a-mole')!
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(CONFIG.medium.duration)
  const spawnRef = useRef<number | null>(null)
  const tickRef = useRef<number | null>(null)
  const [best, setBest] = useLocalStorage<Record<Difficulty, number>>(
    'wam-best',
    { easy: 0, medium: 0, hard: 0 },
  )

  useEffect(() => () => stop(), [])

  function stop() {
    if (spawnRef.current) window.clearInterval(spawnRef.current)
    if (tickRef.current) window.clearInterval(tickRef.current)
    spawnRef.current = null
    tickRef.current = null
  }

  function start() {
    stop()
    setScore(0)
    setMisses(0)
    setActiveIdx(null)
    const cfg = CONFIG[difficulty]
    setRemaining(cfg.duration)
    setRunning(true)

    const pickNext = () => {
      setActiveIdx((prev) => {
        let next = Math.floor(Math.random() * GRID)
        if (next === prev) next = (next + 1) % GRID
        return next
      })
    }
    pickNext()
    spawnRef.current = window.setInterval(pickNext, cfg.interval)
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          finish()
          return 0
        }
        return r - 1
      })
    }, 1000)
  }

  function finish() {
    stop()
    setRunning(false)
    setActiveIdx(null)
    setScore((s) => {
      setBest((b) => (s > b[difficulty] ? { ...b, [difficulty]: s } : b))
      return s
    })
  }

  function whack(i: number) {
    if (!running) return
    if (i === activeIdx) {
      setScore((s) => s + 1)
      setActiveIdx(null)
    } else {
      setMisses((m) => m + 1)
    }
  }

  const cfg = CONFIG[difficulty]
  const pct = running ? (remaining / cfg.duration) * 100 : 0

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip color="primary" label={`Score: ${score}`} />
      <Chip label={`Misses: ${misses}`} />
      <Chip label={`Time: ${running ? `${remaining}s` : '—'}`} variant="outlined" />
      <Chip
        label={`Best (${cfg.label.split(' · ')[1]}): ${best[difficulty]}`}
        variant="outlined"
      />
    </Stack>
  )

  return (
    <GameShell meta={meta} onRestart={start} status={status}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="flex-start"
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            flex: 1,
            width: '100%',
          }}
        >
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ mb: 2, height: 8, borderRadius: 5 }}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            {Array.from({ length: GRID }).map((_, i) => {
              const active = activeIdx === i && running
              return (
                <Box
                  key={i}
                  onClick={() => whack(i)}
                  sx={{
                    aspectRatio: '1 / 1',
                    borderRadius: 3,
                    cursor: running ? 'pointer' : 'default',
                    display: 'grid',
                    placeItems: 'center',
                    background: (t) =>
                      t.palette.mode === 'dark'
                        ? 'linear-gradient(180deg, #1a1f33 0%, #0d1020 100%)'
                        : 'linear-gradient(180deg, #eef0f8 0%, #dfe3f0 100%)',
                    border: (t) => `1px solid ${t.palette.divider}`,
                    fontSize: 48,
                    userSelect: 'none',
                    transition: 'transform 120ms',
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 40,
                      transform: active ? 'translateY(0)' : 'translateY(120%)',
                      opacity: active ? 1 : 0,
                      transition: 'transform 160ms, opacity 160ms',
                    }}
                  >
                    🐹
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            width: { xs: '100%', md: 280 },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Stack spacing={2}>
            <FormControl size="small" disabled={running}>
              <InputLabel id="wam-diff">Difficulty</InputLabel>
              <Select
                labelId="wam-diff"
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <MenuItem value="easy">Easy · {CONFIG.easy.label}</MenuItem>
                <MenuItem value="medium">Medium · {CONFIG.medium.label}</MenuItem>
                <MenuItem value="hard">Hard · {CONFIG.hard.label}</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={running ? finish : start}
              color={running ? 'warning' : 'primary'}
            >
              {running ? 'End early' : 'Start'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Tap the mole as quickly as you can. Speed increases on harder
              difficulties.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
