import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Pad = 0 | 1 | 2 | 3
type Phase = 'idle' | 'showing' | 'input' | 'fail'
type Speed = 'easy' | 'medium' | 'hard'

const PADS: {
  color: string
  active: string
  label: string
  tone: number
}[] = [
  { color: '#16a34a', active: '#4ade80', label: 'green', tone: 329.63 },
  { color: '#dc2626', active: '#fca5a5', label: 'red', tone: 261.63 },
  { color: '#ca8a04', active: '#fde047', label: 'yellow', tone: 440 },
  { color: '#2563eb', active: '#93c5fd', label: 'blue', tone: 164.81 },
]

const SPEEDS: Record<Speed, { show: number; gap: number; label: string }> = {
  easy: { show: 600, gap: 260, label: 'Slow' },
  medium: { show: 420, gap: 180, label: 'Normal' },
  hard: { show: 260, gap: 120, label: 'Fast' },
}

function playTone(freq: number) {
  try {
    const Ctx =
      (window as unknown as { AudioContext?: typeof AudioContext })
        .AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.32)
    osc.onended = () => ctx.close()
  } catch {
    // audio not supported
  }
}

export default function SimonSays() {
  const meta = gameBySlug('simon-says')!
  const [speed, setSpeed] = useState<Speed>('medium')
  const [sequence, setSequence] = useState<Pad[]>([])
  const [inputIdx, setInputIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [litPad, setLitPad] = useState<Pad | null>(null)
  const [best, setBest] = useLocalStorage<number>('simon-best', 0)
  const cancelRef = useRef(false)

  useEffect(() => () => {
    cancelRef.current = true
  }, [])

  const showSequence = useCallback(
    async (seq: Pad[]) => {
      setPhase('showing')
      const cfg = SPEEDS[speed]
      for (let i = 0; i < seq.length; i++) {
        if (cancelRef.current) return
        await new Promise((r) => setTimeout(r, cfg.gap))
        if (cancelRef.current) return
        setLitPad(seq[i])
        playTone(PADS[seq[i]].tone)
        await new Promise((r) => setTimeout(r, cfg.show))
        setLitPad(null)
      }
      setInputIdx(0)
      setPhase('input')
    },
    [speed],
  )

  function start() {
    cancelRef.current = false
    const first = Math.floor(Math.random() * 4) as Pad
    setSequence([first])
    setInputIdx(0)
    showSequence([first])
  }

  function reset() {
    cancelRef.current = true
    setSequence([])
    setInputIdx(0)
    setPhase('idle')
    setLitPad(null)
  }

  function handlePad(p: Pad) {
    if (phase !== 'input') return
    playTone(PADS[p].tone)
    setLitPad(p)
    setTimeout(() => setLitPad(null), 150)

    if (sequence[inputIdx] !== p) {
      setPhase('fail')
      setBest((b) => (sequence.length - 1 > b ? sequence.length - 1 : b))
      return
    }
    const next = inputIdx + 1
    if (next === sequence.length) {
      setPhase('showing')
      setTimeout(() => {
        const add = Math.floor(Math.random() * 4) as Pad
        const newSeq: Pad[] = [...sequence, add]
        setSequence(newSeq)
        showSequence(newSeq)
      }, 650)
    } else {
      setInputIdx(next)
    }
  }

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip color="primary" label={`Round: ${sequence.length}`} />
      <Chip label={`Best: ${best}`} variant="outlined" />
      <Chip
        color={
          phase === 'showing'
            ? 'warning'
            : phase === 'input'
              ? 'success'
              : phase === 'fail'
                ? 'error'
                : 'default'
        }
        label={
          phase === 'showing'
            ? 'Watch…'
            : phase === 'input'
              ? 'Your turn'
              : phase === 'fail'
                ? 'Wrong! Try again'
                : 'Idle'
        }
      />
    </Stack>
  )

  return (
    <GameShell meta={meta} onRestart={reset} status={status}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="flex-start"
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            flex: 1,
            width: '100%',
          }}
        >
          {phase === 'fail' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              You reached round {sequence.length}. Press start to try again.
            </Alert>
          )}
          <Box
            sx={{
              position: 'relative',
              width: 'min(100%, 380px)',
              aspectRatio: '1 / 1',
              mx: 'auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 1.5,
            }}
          >
            {PADS.map((p, i) => {
              const active = litPad === i
              const disabled = phase !== 'input'
              return (
                <Box
                  key={i}
                  role="button"
                  aria-label={p.label}
                  tabIndex={0}
                  onClick={() => handlePad(i as Pad)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handlePad(i as Pad)
                    }
                  }}
                  sx={{
                    borderRadius:
                      i === 0
                        ? '100% 0 0 0'
                        : i === 1
                          ? '0 100% 0 0'
                          : i === 2
                            ? '0 0 0 100%'
                            : '0 0 100% 0',
                    background: active ? p.active : p.color,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled && !active ? 0.78 : 1,
                    transition: 'background 120ms, transform 120ms',
                    boxShadow: active
                      ? `0 0 28px ${p.active}`
                      : 'inset 0 -6px 0 rgba(0,0,0,.25)',
                    transform: active ? 'scale(0.98)' : 'none',
                    outline: 'none',
                  }}
                />
              )
            })}
            <Box
              sx={{
                position: 'absolute',
                inset: '35%',
                borderRadius: '50%',
                bgcolor: 'background.paper',
                border: (t) => `3px solid ${t.palette.divider}`,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,.2)',
              }}
            >
              <Typography variant="h5" fontWeight={800}>
                {sequence.length}
              </Typography>
            </Box>
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
            <FormControl size="small" disabled={phase === 'showing' || phase === 'input'}>
              <InputLabel id="simon-speed">Speed</InputLabel>
              <Select
                labelId="simon-speed"
                label="Speed"
                value={speed}
                onChange={(e) => setSpeed(e.target.value as Speed)}
              >
                <MenuItem value="easy">Slow</MenuItem>
                <MenuItem value="medium">Normal</MenuItem>
                <MenuItem value="hard">Fast</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={start}>
              {phase === 'fail' || phase === 'idle' ? 'Start' : 'Restart'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Watch the sequence light up, then repeat it. Each round adds one
              more color.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
