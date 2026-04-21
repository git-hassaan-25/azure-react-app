import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Phase = 'idle' | 'waiting' | 'ready' | 'clicked' | 'tooSoon' | 'done'

const ROUNDS = 5

export default function ReactionTime() {
  const meta = gameBySlug('reaction-time')!
  const [phase, setPhase] = useState<Phase>('idle')
  const [reactMs, setReactMs] = useState<number | null>(null)
  const [results, setResults] = useState<number[]>([])
  const timerRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const [best, setBest] = useLocalStorage<number | null>('rt-best', null)

  useEffect(() => () => clearTimer(), [])

  function clearTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function beginRound() {
    clearTimer()
    setReactMs(null)
    setPhase('waiting')
    const delay = 1200 + Math.random() * 2800
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now()
      setPhase('ready')
    }, delay)
  }

  function handleClick() {
    if (phase === 'idle' || phase === 'done') {
      setResults([])
      beginRound()
      return
    }
    if (phase === 'waiting') {
      clearTimer()
      setPhase('tooSoon')
      return
    }
    if (phase === 'ready') {
      const ms = Math.round(performance.now() - startRef.current)
      setReactMs(ms)
      setResults((r) => {
        const next = [...r, ms]
        if (next.length >= ROUNDS) {
          setPhase('done')
          const avg = Math.round(next.reduce((s, v) => s + v, 0) / next.length)
          setBest((b) => (b === null || avg < b ? avg : b))
        } else {
          setPhase('clicked')
        }
        return next
      })
      return
    }
    if (phase === 'clicked' || phase === 'tooSoon') {
      beginRound()
    }
  }

  const colors: Record<Phase, { bg: string; msg: string; sub: string }> = {
    idle: {
      bg: 'linear-gradient(135deg, #6C4BFF, #8B5CF6)',
      msg: 'Click to start',
      sub: `${ROUNDS} rounds · average reaction time`,
    },
    waiting: {
      bg: 'linear-gradient(135deg, #ef4444, #f97316)',
      msg: 'Wait for green…',
      sub: 'Don’t click yet',
    },
    ready: {
      bg: 'linear-gradient(135deg, #22c55e, #10b981)',
      msg: 'CLICK!',
      sub: 'Now!',
    },
    clicked: {
      bg: 'linear-gradient(135deg, #6C4BFF, #8B5CF6)',
      msg: `${reactMs} ms`,
      sub: `Round ${results.length} of ${ROUNDS} · click to continue`,
    },
    tooSoon: {
      bg: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      msg: 'Too soon!',
      sub: 'Click to retry',
    },
    done: {
      bg: 'linear-gradient(135deg, #6C4BFF, #FF4B8B)',
      msg: `Avg ${Math.round(
        results.reduce((s, v) => s + v, 0) / results.length || 0,
      )} ms`,
      sub: 'Click to play again',
    },
  }

  const c = colors[phase]

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip
        color="primary"
        label={`Round: ${Math.min(results.length + (phase === 'done' ? 0 : phase === 'idle' ? 0 : 1), ROUNDS)} / ${ROUNDS}`}
      />
      <Chip label={`Best avg: ${best !== null ? `${best} ms` : '—'}`} variant="outlined" />
      {reactMs !== null && phase !== 'tooSoon' && (
        <Chip color="success" label={`Last: ${reactMs} ms`} />
      )}
    </Stack>
  )

  return (
    <GameShell
      meta={meta}
      onRestart={() => {
        clearTimer()
        setPhase('idle')
        setResults([])
        setReactMs(null)
      }}
      status={status}
    >
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 4,
          overflow: 'hidden',
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              handleClick()
            }
          }}
          sx={{
            minHeight: 360,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: 'white',
            background: c.bg,
            transition: 'background 200ms',
            userSelect: 'none',
            outline: 'none',
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: 48, md: 72 }, textAlign: 'center', px: 2 }}
            >
              {c.msg}
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>{c.sub}</Typography>
          </Stack>
        </Box>

        {results.length > 0 && (
          <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>
            <Typography variant="overline" color="text.secondary">
              Rounds
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
              {results.map((r, i) => (
                <Chip key={i} label={`#${i + 1} · ${r} ms`} />
              ))}
              {phase === 'done' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setResults([])
                    setPhase('idle')
                  }}
                >
                  Reset
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Paper>
    </GameShell>
  )
}
