import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Difficulty = 'easy' | 'medium' | 'hard'

const SETTINGS: Record<
  Difficulty,
  { max: number; attempts: number; label: string }
> = {
  easy: { max: 50, attempts: 8, label: '1 – 50' },
  medium: { max: 100, attempts: 7, label: '1 – 100' },
  hard: { max: 500, attempts: 10, label: '1 – 500' },
}

interface Guess {
  value: number
  hint: 'higher' | 'lower' | 'correct'
}

function randTarget(max: number) {
  return Math.floor(Math.random() * max) + 1
}

export default function NumberGuessing() {
  const meta = gameBySlug('number-guessing')!
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [target, setTarget] = useState(() => randTarget(SETTINGS.medium.max))
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Guess[]>([])
  const [error, setError] = useState<string | null>(null)
  const [best, setBest] = useLocalStorage<Record<Difficulty, number | null>>(
    'ng-best',
    { easy: null, medium: null, hard: null },
  )

  const config = SETTINGS[difficulty]
  const attemptsUsed = history.length
  const attemptsLeft = Math.max(config.attempts - attemptsUsed, 0)
  const won = history.at(-1)?.hint === 'correct'
  const lost = !won && attemptsLeft === 0

  const progressPct = useMemo(
    () => Math.min(100, (attemptsUsed / config.attempts) * 100),
    [attemptsUsed, config.attempts],
  )

  function reset(next: Difficulty = difficulty) {
    setDifficulty(next)
    setTarget(randTarget(SETTINGS[next].max))
    setHistory([])
    setInput('')
    setError(null)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (won || lost) return
    const n = Number(input)
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      setError('Enter a whole number.')
      return
    }
    if (n < 1 || n > config.max) {
      setError(`Number must be between 1 and ${config.max}.`)
      return
    }
    const hint: Guess['hint'] =
      n === target ? 'correct' : n < target ? 'higher' : 'lower'
    const nextHistory = [...history, { value: n, hint }]
    setHistory(nextHistory)
    setInput('')
    if (hint === 'correct') {
      setBest((prev) => {
        const current = prev[difficulty]
        const attempts = nextHistory.length
        if (current === null || attempts < current) {
          return { ...prev, [difficulty]: attempts }
        }
        return prev
      })
    }
  }

  const bestScore = best[difficulty]

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip color="primary" label={`Range: ${config.label}`} />
      <Chip label={`Attempts: ${attemptsUsed}/${config.attempts}`} />
      <Chip
        label={`Best: ${bestScore ?? '—'}`}
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
          <Typography variant="h6" gutterBottom>
            Make a guess
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{ mb: 2, height: 8, borderRadius: 5 }}
          />

          {won && (
            <Alert severity="success" sx={{ mb: 2 }}>
              You got it in {attemptsUsed} attempt{attemptsUsed === 1 ? '' : 's'}!
            </Alert>
          )}
          {lost && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Out of attempts. The number was <strong>{target}</strong>.
            </Alert>
          )}

          <Box component="form" onSubmit={submit}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                type="number"
                fullWidth
                placeholder={`Between 1 and ${config.max}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                inputProps={{ min: 1, max: config.max }}
                disabled={won || lost}
                autoFocus
                error={Boolean(error)}
                helperText={error}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={won || lost || !input}
                sx={{ px: 3 }}
              >
                Guess
              </Button>
            </Stack>
          </Box>

          {history.length > 0 && (
            <Box mt={2}>
              <Typography variant="overline" color="text.secondary">
                History
              </Typography>
              <List dense>
                {history
                  .slice()
                  .reverse()
                  .map((g, i) => (
                    <ListItem
                      key={`${g.value}-${history.length - i}`}
                      sx={{
                        borderRadius: 2,
                        bgcolor: (t) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(255,255,255,.03)'
                            : 'rgba(0,0,0,.03)',
                        mb: 0.5,
                      }}
                    >
                      <ListItemIcon>
                        {g.hint === 'correct' ? (
                          <CheckCircleIcon color="success" />
                        ) : g.hint === 'higher' ? (
                          <ArrowUpwardIcon color="primary" />
                        ) : (
                          <ArrowDownwardIcon color="secondary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={g.value}
                        secondary={
                          g.hint === 'correct'
                            ? 'Correct!'
                            : g.hint === 'higher'
                              ? 'Try higher'
                              : 'Try lower'
                        }
                        primaryTypographyProps={{ fontWeight: 700 }}
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}
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
            <FormControl size="small">
              <InputLabel id="diff-label">Difficulty</InputLabel>
              <Select
                labelId="diff-label"
                label="Difficulty"
                value={difficulty}
                onChange={(e) => reset(e.target.value as Difficulty)}
              >
                <MenuItem value="easy">Easy · 1-50, 8 tries</MenuItem>
                <MenuItem value="medium">Medium · 1-100, 7 tries</MenuItem>
                <MenuItem value="hard">Hard · 1-500, 10 tries</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => reset()}>
              New number
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
