import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
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
  TextField,
  Typography,
} from '@mui/material'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Duration = 15 | 30 | 60

const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'while',
  'river', 'flows', 'past', 'bright', 'lantern', 'garden', 'whisper',
  'storm', 'silver', 'cloud', 'mountain', 'calm', 'wander', 'forest',
  'echo', 'ocean', 'horizon', 'velvet', 'ember', 'meadow', 'lantern',
  'thought', 'moment', 'pattern', 'journey', 'morning', 'golden',
  'distant', 'music', 'simple', 'language', 'carry', 'sunlight', 'chamber',
  'window', 'mirror', 'cadence', 'cinnamon', 'quiet', 'gather', 'daylight',
  'clever', 'velvet', 'bronze', 'cascade', 'gentle', 'crystal', 'harbor',
  'breeze', 'timber', 'meadow', 'parade', 'shadow', 'lantern', 'marble',
  'cypress', 'thread', 'lattice', 'vanilla', 'ripple', 'saffron', 'honey',
]

function buildSample(count: number): string {
  const words: string[] = []
  for (let i = 0; i < count; i++)
    words.push(WORDS[Math.floor(Math.random() * WORDS.length)])
  return words.join(' ')
}

export default function TypingSpeed() {
  const meta = gameBySlug('typing-speed')!
  const [duration, setDuration] = useState<Duration>(30)
  const [sample, setSample] = useState(() => buildSample(70))
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number>(30)
  const [finished, setFinished] = useState(false)
  const tickRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [best, setBest] = useLocalStorage<Record<Duration, number>>(
    'typing-best',
    { 15: 0, 30: 0, 60: 0 },
  )

  useEffect(() => () => {
    if (tickRef.current) window.clearInterval(tickRef.current)
  }, [])

  const { correct, incorrect } = useMemo(() => {
    let c = 0
    let w = 0
    for (let i = 0; i < typed.length; i++) {
      if (i >= sample.length) {
        w++
      } else if (typed[i] === sample[i]) c++
      else w++
    }
    return { correct: c, incorrect: w }
  }, [typed, sample])

  const elapsed =
    startedAt !== null ? (Date.now() - startedAt) / 1000 : 0
  const minutes = elapsed / 60 || 1 / 60
  const wpm = finished
    ? Math.round((correct / 5) / (duration / 60))
    : startedAt
      ? Math.round(correct / 5 / minutes)
      : 0
  const accuracy =
    typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100

  function start() {
    if (startedAt || finished) return
    const now = Date.now()
    setStartedAt(now)
    if (tickRef.current) window.clearInterval(tickRef.current)
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
    if (tickRef.current) window.clearInterval(tickRef.current)
    tickRef.current = null
    setFinished(true)
  }

  useEffect(() => {
    if (finished) {
      const finalWpm = Math.round(correct / 5 / (duration / 60))
      setBest((b) => (finalWpm > b[duration] ? { ...b, [duration]: finalWpm } : b))
    }
  }, [finished])

  function reset(nextDuration: Duration = duration) {
    if (tickRef.current) window.clearInterval(tickRef.current)
    tickRef.current = null
    setDuration(nextDuration)
    setRemaining(nextDuration)
    setSample(buildSample(nextDuration === 15 ? 40 : nextDuration === 30 ? 70 : 140))
    setTyped('')
    setStartedAt(null)
    setFinished(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (finished) return
    const val = e.target.value
    if (!startedAt && val.length === 1) start()
    if (val.length <= sample.length + 20) setTyped(val)
    if (val.length >= sample.length) finish()
  }

  const pct = remaining && !finished ? (remaining / duration) * 100 : 0

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip color="primary" label={`WPM: ${wpm}`} />
      <Chip label={`Accuracy: ${accuracy}%`} />
      <Chip label={`Time: ${remaining}s`} variant="outlined" />
      <Chip
        label={`Best (${duration}s): ${best[duration]}`}
        variant="outlined"
      />
    </Stack>
  )

  return (
    <GameShell meta={meta} onRestart={() => reset()} status={status}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="flex-start"
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
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

          {finished && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Finished! {wpm} WPM at {accuracy}% accuracy.
            </Alert>
          )}

          <Box
            onClick={() => inputRef.current?.focus()}
            sx={{
              fontFamily:
                '"JetBrains Mono", ui-monospace, Consolas, monospace',
              fontSize: { xs: 18, md: 22 },
              lineHeight: 1.6,
              p: 2.5,
              borderRadius: 2,
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,.03)'
                  : 'rgba(0,0,0,.03)',
              cursor: 'text',
              minHeight: 140,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {sample.split('').map((ch, i) => {
              const typedCh = typed[i]
              let color: string = 'text.secondary'
              let bg = 'transparent'
              if (typedCh !== undefined) {
                color = typedCh === ch ? 'success.main' : 'error.main'
                if (typedCh !== ch)
                  bg =
                    ch === ' '
                      ? 'rgba(239,68,68,.2)'
                      : 'rgba(239,68,68,.12)'
              }
              const isCursor = i === typed.length && !finished
              return (
                <Box
                  key={i}
                  component="span"
                  sx={{
                    color,
                    bgcolor: bg,
                    borderLeft: isCursor
                      ? (t) => `2px solid ${t.palette.primary.main}`
                      : 'none',
                    animation: isCursor ? 'floatY 800ms ease-in-out infinite' : 'none',
                  }}
                >
                  {ch}
                </Box>
              )
            })}
          </Box>

          <TextField
            inputRef={inputRef}
            value={typed}
            onChange={onChange}
            disabled={finished}
            autoFocus
            placeholder="Start typing to begin the timer…"
            fullWidth
            sx={{ mt: 2 }}
            inputProps={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: 'off',
              spellCheck: false,
              style: {
                fontFamily:
                  '"JetBrains Mono", ui-monospace, Consolas, monospace',
              },
            }}
          />

          <Stack direction="row" spacing={2} mt={2} flexWrap="wrap" useFlexGap>
            <Chip label={`Correct: ${correct}`} color="success" variant="outlined" />
            <Chip label={`Errors: ${incorrect}`} color="error" variant="outlined" />
          </Stack>
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
            <FormControl size="small" disabled={Boolean(startedAt) && !finished}>
              <InputLabel id="typing-duration">Duration</InputLabel>
              <Select
                labelId="typing-duration"
                label="Duration"
                value={duration}
                onChange={(e) => reset(Number(e.target.value) as Duration)}
              >
                <MenuItem value={15}>15 seconds</MenuItem>
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>60 seconds</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => reset()}>
              New passage
            </Button>
            <Typography variant="body2" color="text.secondary">
              WPM is standardized at 5 characters per word. Timer starts when
              you type your first character.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
