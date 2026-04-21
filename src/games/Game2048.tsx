import { useCallback, useEffect, useRef, useState } from 'react'
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

type Grid = number[][]
type Dir = 'up' | 'down' | 'left' | 'right'

const SIZE = 4

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandom(g: Grid): Grid {
  const empties: [number, number][] = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (g[r][c] === 0) empties.push([r, c])
  if (!empties.length) return g
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]
  const next = g.map((row) => row.slice())
  next[r][c] = Math.random() < 0.9 ? 2 : 4
  return next
}

function startGrid(): Grid {
  return addRandom(addRandom(emptyGrid()))
}

function compressRow(row: number[]): { row: number[]; gained: number } {
  const filtered = row.filter((v) => v !== 0)
  let gained = 0
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2
      gained += filtered[i]
      filtered.splice(i + 1, 1)
    }
  }
  while (filtered.length < SIZE) filtered.push(0)
  return { row: filtered, gained }
}

function transpose(g: Grid): Grid {
  const out = emptyGrid()
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) out[c][r] = g[r][c]
  return out
}

function reverseRows(g: Grid): Grid {
  return g.map((row) => row.slice().reverse())
}

function move(grid: Grid, dir: Dir): {
  grid: Grid
  gained: number
  moved: boolean
} {
  let work = grid.map((r) => r.slice())
  if (dir === 'right') work = reverseRows(work)
  else if (dir === 'up') work = transpose(work)
  else if (dir === 'down') work = reverseRows(transpose(work))

  let gained = 0
  const compressed = work.map((row) => {
    const { row: r, gained: g } = compressRow(row)
    gained += g
    return r
  })

  let result = compressed
  if (dir === 'right') result = reverseRows(result)
  else if (dir === 'up') result = transpose(result)
  else if (dir === 'down') result = transpose(reverseRows(result))

  const changed = JSON.stringify(result) !== JSON.stringify(grid)
  return { grid: result, gained, moved: changed }
}

function canMove(g: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === 0) return true
      if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return true
      if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return true
    }
  return false
}

const TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  0: { bg: 'rgba(127,127,127,.12)', fg: 'transparent' },
  2: { bg: '#eef2ff', fg: '#1e293b' },
  4: { bg: '#e0e7ff', fg: '#1e293b' },
  8: { bg: '#c7d2fe', fg: '#0f172a' },
  16: { bg: '#a78bfa', fg: '#fff' },
  32: { bg: '#8b5cf6', fg: '#fff' },
  64: { bg: '#7c3aed', fg: '#fff' },
  128: { bg: '#f472b6', fg: '#fff' },
  256: { bg: '#ec4899', fg: '#fff' },
  512: { bg: '#f59e0b', fg: '#fff' },
  1024: { bg: '#ef4444', fg: '#fff' },
  2048: { bg: '#10b981', fg: '#fff' },
}

function tileStyle(v: number) {
  return (
    TILE_COLORS[v] ?? {
      bg: 'linear-gradient(135deg, #22c55e, #10b981)',
      fg: '#fff',
    }
  )
}

export default function Game2048() {
  const meta = gameBySlug('2048')!
  const [grid, setGrid] = useState<Grid>(startGrid)
  const [score, setScore] = useState(0)
  const [best, setBest] = useLocalStorage<number>('g2048-best', 0)
  const [over, setOver] = useState(false)
  const [won, setWon] = useState(false)
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const doMove = useCallback(
    (dir: Dir) => {
      if (over) return
      setGrid((g) => {
        const { grid: next, gained, moved } = move(g, dir)
        if (!moved) return g
        const withNew = addRandom(next)
        setScore((s) => {
          const ns = s + gained
          setBest((b) => (ns > b ? ns : b))
          return ns
        })
        if (withNew.some((row) => row.some((v) => v === 2048))) setWon(true)
        if (!canMove(withNew)) setOver(true)
        return withNew
      })
    },
    [over, setBest],
  )

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
        doMove(d)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [doMove])

  function reset() {
    setGrid(startGrid())
    setScore(0)
    setOver(false)
    setWon(false)
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchRef.current
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const ax = Math.abs(dx)
    const ay = Math.abs(dy)
    if (Math.max(ax, ay) < 24) return
    if (ax > ay) doMove(dx > 0 ? 'right' : 'left')
    else doMove(dy > 0 ? 'down' : 'up')
    touchRef.current = null
  }

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip color="primary" label={`Score: ${score}`} />
      <Chip label={`Best: ${best}`} variant="outlined" />
      {won && <Chip color="success" label="Hit 2048! 🎉" />}
      {over && <Chip color="error" label="No moves left" />}
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
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            flex: 1,
            width: '100%',
          }}
        >
          <Box
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              gap: 1,
              maxWidth: 480,
              mx: 'auto',
              p: 1,
              borderRadius: 3,
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,.04)'
                  : 'rgba(0,0,0,.05)',
              touchAction: 'none',
            }}
          >
            {grid.flat().map((v, i) => {
              const s = tileStyle(v)
              return (
                <Box
                  key={i}
                  sx={{
                    aspectRatio: '1 / 1',
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    background: s.bg,
                    color: s.fg,
                    fontWeight: 800,
                    fontSize: v >= 1024 ? 26 : v >= 128 ? 30 : 36,
                    transition: 'background 180ms, transform 180ms',
                    animation: v ? 'popIn 180ms ease' : undefined,
                  }}
                >
                  {v || ''}
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
            How to play
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Use arrow keys, WASD, or swipe. When two tiles with the same number
            touch, they merge into one with twice the value.
          </Typography>
          <Button variant="contained" onClick={reset} fullWidth>
            New game
          </Button>
        </Paper>
      </Stack>
    </GameShell>
  )
}
