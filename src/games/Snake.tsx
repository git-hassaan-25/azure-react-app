import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Cell = { x: number; y: number }
type Dir = 'up' | 'down' | 'left' | 'right'
type Difficulty = 'easy' | 'medium' | 'hard'

const GRID = 20
const SPEEDS: Record<Difficulty, { ms: number; label: string }> = {
  easy: { ms: 180, label: 'Chill' },
  medium: { ms: 120, label: 'Normal' },
  hard: { ms: 75, label: 'Frenzy' },
}

const DIR_VEC: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

function randomFood(snake: Cell[]): Cell {
  const taken = new Set(snake.map((c) => `${c.x},${c.y}`))
  while (true) {
    const x = Math.floor(Math.random() * GRID)
    const y = Math.floor(Math.random() * GRID)
    if (!taken.has(`${x},${y}`)) return { x, y }
  }
}

const START_SNAKE: Cell[] = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
]

export default function Snake() {
  const meta = gameBySlug('snake')!
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [snake, setSnake] = useState<Cell[]>(START_SNAKE)
  const [food, setFood] = useState<Cell>({ x: 14, y: 10 })
  const [dir, setDir] = useState<Dir>('right')
  const [running, setRunning] = useState(false)
  const [over, setOver] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useLocalStorage<Record<Difficulty, number>>(
    'snake-best',
    { easy: 0, medium: 0, hard: 0 },
  )

  const dirRef = useRef<Dir>(dir)
  const pendingRef = useRef<Dir | null>(null)

  const changeDir = useCallback((next: Dir) => {
    if (OPPOSITE[next] === dirRef.current) return
    pendingRef.current = next
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      }
      const d = map[e.key]
      if (d) {
        e.preventDefault()
        changeDir(d)
      }
      if (e.key === ' ') setRunning((r) => !r)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [changeDir])

  const reset = useCallback(() => {
    setSnake(START_SNAKE)
    setFood({ x: 14, y: 10 })
    setDir('right')
    dirRef.current = 'right'
    pendingRef.current = null
    setScore(0)
    setOver(false)
    setRunning(false)
  }, [])

  useEffect(() => {
    if (!running || over) return
    const id = window.setInterval(() => {
      setSnake((prev) => {
        const applied = pendingRef.current ?? dirRef.current
        dirRef.current = applied
        setDir(applied)
        const head = prev[0]
        const vec = DIR_VEC[applied]
        const next = { x: head.x + vec.x, y: head.y + vec.y }

        if (
          next.x < 0 ||
          next.y < 0 ||
          next.x >= GRID ||
          next.y >= GRID ||
          prev.some((c) => c.x === next.x && c.y === next.y)
        ) {
          setOver(true)
          setRunning(false)
          setScore((s) => {
            setBest((b) =>
              s > b[difficulty] ? { ...b, [difficulty]: s } : b,
            )
            return s
          })
          return prev
        }

        const ate = next.x === food.x && next.y === food.y
        const nextSnake = [next, ...prev]
        if (!ate) nextSnake.pop()
        else {
          setScore((s) => s + 1)
          setFood(randomFood(nextSnake))
        }
        pendingRef.current = null
        return nextSnake
      })
    }, SPEEDS[difficulty].ms)
    return () => window.clearInterval(id)
  }, [running, over, difficulty, food.x, food.y, setBest])

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip color="primary" label={`Score: ${score}`} />
      <Chip
        label={`Best (${SPEEDS[difficulty].label}): ${best[difficulty]}`}
        variant="outlined"
      />
      <Chip
        color={over ? 'error' : running ? 'success' : 'default'}
        label={over ? 'Game over' : running ? 'Running' : 'Paused'}
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
            p: { xs: 1.5, md: 2 },
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            flex: 1,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID}, 1fr)`,
              gap: 0.25,
              aspectRatio: '1 / 1',
              maxWidth: 520,
              mx: 'auto',
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#0a0f1e' : '#eef0f8',
              borderRadius: 2,
              p: 0.5,
            }}
          >
            {Array.from({ length: GRID * GRID }).map((_, i) => {
              const x = i % GRID
              const y = Math.floor(i / GRID)
              const isHead = snake[0].x === x && snake[0].y === y
              const isBody =
                !isHead && snake.some((c) => c.x === x && c.y === y)
              const isFood = food.x === x && food.y === y
              return (
                <Box
                  key={i}
                  sx={{
                    aspectRatio: '1 / 1',
                    borderRadius: 0.7,
                    bgcolor: isHead
                      ? '#22c55e'
                      : isBody
                        ? '#10b981'
                        : isFood
                          ? '#ef4444'
                          : 'transparent',
                    boxShadow: isHead
                      ? '0 0 12px rgba(34,197,94,0.7)'
                      : isFood
                        ? '0 0 10px rgba(239,68,68,0.7)'
                        : 'none',
                  }}
                />
              )
            })}
          </Box>

          <Box
            sx={{
              display: { xs: 'grid', md: 'none' },
              gridTemplateColumns: 'repeat(3, 64px)',
              gridTemplateRows: 'repeat(3, 64px)',
              justifyContent: 'center',
              mt: 2,
              gap: 1,
            }}
          >
            <Box />
            <IconButton
              onClick={() => changeDir('up')}
              sx={{ bgcolor: 'background.default' }}
            >
              <KeyboardArrowUpIcon />
            </IconButton>
            <Box />
            <IconButton
              onClick={() => changeDir('left')}
              sx={{ bgcolor: 'background.default' }}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <Box />
            <IconButton
              onClick={() => changeDir('right')}
              sx={{ bgcolor: 'background.default' }}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <Box />
            <IconButton
              onClick={() => changeDir('down')}
              sx={{ bgcolor: 'background.default' }}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
            <Box />
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
            <FormControl size="small" disabled={running && !over}>
              <InputLabel id="snake-diff">Speed</InputLabel>
              <Select
                labelId="snake-diff"
                label="Speed"
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as Difficulty)
                  reset()
                }}
              >
                <MenuItem value="easy">Chill · slow</MenuItem>
                <MenuItem value="medium">Normal</MenuItem>
                <MenuItem value="hard">Frenzy · fast</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => {
                if (over) reset()
                else setRunning((r) => !r)
              }}
              color={running ? 'warning' : 'primary'}
            >
              {over ? 'Play again' : running ? 'Pause' : 'Start'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Use arrow keys or WASD. Press space to pause. On mobile, use the
              on-screen pad.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
