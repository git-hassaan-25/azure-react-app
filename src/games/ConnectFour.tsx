import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Cell = 'R' | 'Y' | null
type Board = Cell[][]
type Mode = 'cpu' | 'pvp'
type Difficulty = 'easy' | 'medium' | 'hard'

const ROWS = 6
const COLS = 7

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function drop(board: Board, col: number, player: 'R' | 'Y'): Board | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      const next = board.map((row) => row.slice())
      next[r][col] = player
      return next
    }
  }
  return null
}

function winCheck(
  board: Board,
): { winner: 'R' | 'Y' | null; cells: [number, number][] | null } {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c]
      if (!v) continue
      for (const [dr, dc] of dirs) {
        const cells: [number, number][] = [[r, c]]
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k
          const nc = c + dc * k
          if (
            nr < 0 ||
            nr >= ROWS ||
            nc < 0 ||
            nc >= COLS ||
            board[nr][nc] !== v
          )
            break
          cells.push([nr, nc])
        }
        if (cells.length === 4) return { winner: v, cells }
      }
    }
  }
  return { winner: null, cells: null }
}

function isFull(board: Board) {
  return board[0].every((c) => c !== null)
}

function availableCols(board: Board): number[] {
  return [0, 1, 2, 3, 4, 5, 6].filter((c) => board[0][c] === null)
}

function scorePosition(board: Board, player: 'R' | 'Y'): number {
  const opp: 'R' | 'Y' = player === 'R' ? 'Y' : 'R'
  let score = 0
  const center = Math.floor(COLS / 2)
  for (let r = 0; r < ROWS; r++) if (board[r][center] === player) score += 3

  const windows: Cell[][] = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      windows.push([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]])
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - 4; r++)
      windows.push([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]])
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      windows.push([
        board[r][c],
        board[r + 1][c + 1],
        board[r + 2][c + 2],
        board[r + 3][c + 3],
      ])
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      windows.push([
        board[r][c],
        board[r - 1][c + 1],
        board[r - 2][c + 2],
        board[r - 3][c + 3],
      ])

  for (const w of windows) {
    const me = w.filter((v) => v === player).length
    const them = w.filter((v) => v === opp).length
    const empty = w.filter((v) => v === null).length
    if (me === 4) score += 100
    else if (me === 3 && empty === 1) score += 8
    else if (me === 2 && empty === 2) score += 3
    if (them === 3 && empty === 1) score -= 12
  }
  return score
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  ai: 'R' | 'Y',
): { col: number; score: number } {
  const { winner } = winCheck(board)
  const opp: 'R' | 'Y' = ai === 'R' ? 'Y' : 'R'
  if (winner === ai) return { col: -1, score: 1_000_000 - (6 - depth) }
  if (winner === opp) return { col: -1, score: -1_000_000 + (6 - depth) }
  if (isFull(board) || depth === 0)
    return { col: -1, score: scorePosition(board, ai) }

  const cols = availableCols(board)
  const ordered = cols.sort(
    (a, b) => Math.abs(a - 3) - Math.abs(b - 3), // center-out
  )

  if (maximizing) {
    let best = { col: ordered[0], score: -Infinity }
    for (const col of ordered) {
      const next = drop(board, col, ai)
      if (!next) continue
      const { score } = minimax(next, depth - 1, alpha, beta, false, ai)
      if (score > best.score) best = { col, score }
      alpha = Math.max(alpha, score)
      if (alpha >= beta) break
    }
    return best
  } else {
    let best = { col: ordered[0], score: Infinity }
    for (const col of ordered) {
      const next = drop(board, col, opp)
      if (!next) continue
      const { score } = minimax(next, depth - 1, alpha, beta, true, ai)
      if (score < best.score) best = { col, score }
      beta = Math.min(beta, score)
      if (alpha >= beta) break
    }
    return best
  }
}

function pickAiMove(board: Board, difficulty: Difficulty): number {
  const available = availableCols(board)
  if (difficulty === 'easy')
    return available[Math.floor(Math.random() * available.length)]
  const depth = difficulty === 'medium' ? 3 : 5
  const { col } = minimax(board, depth, -Infinity, Infinity, true, 'Y')
  return col >= 0 ? col : available[Math.floor(Math.random() * available.length)]
}

interface Scores {
  R: number
  Y: number
  draws: number
}

const EMPTY_SCORES: Scores = { R: 0, Y: 0, draws: 0 }

export default function ConnectFour() {
  const meta = gameBySlug('connect-four')!
  const [mode, setMode] = useState<Mode>('cpu')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [turn, setTurn] = useState<'R' | 'Y'>('R')
  const [scores, setScores] = useLocalStorage<Scores>('c4-scores', EMPTY_SCORES)
  const [hoverCol, setHoverCol] = useState<number | null>(null)

  const { winner, cells } = useMemo(() => winCheck(board), [board])
  const winCells = useMemo(
    () => new Set((cells ?? []).map(([r, c]) => `${r}-${c}`)),
    [cells],
  )
  const draw = !winner && isFull(board)
  const over = Boolean(winner) || draw

  useEffect(() => {
    if (!over) return
    if (winner) setScores((s) => ({ ...s, [winner]: s[winner] + 1 }))
    else if (draw) setScores((s) => ({ ...s, draws: s.draws + 1 }))
  }, [over])

  useEffect(() => {
    if (mode !== 'cpu' || turn !== 'Y' || over) return
    const id = setTimeout(() => {
      const col = pickAiMove(board, difficulty)
      const next = drop(board, col, 'Y')
      if (next) {
        setBoard(next)
        setTurn('R')
      }
    }, 500)
    return () => clearTimeout(id)
  }, [mode, turn, over, board, difficulty])

  function play(col: number) {
    if (over) return
    if (mode === 'cpu' && turn === 'Y') return
    const next = drop(board, col, turn)
    if (!next) return
    setBoard(next)
    setTurn(turn === 'R' ? 'Y' : 'R')
  }

  function reset() {
    setBoard(emptyBoard())
    setTurn('R')
  }

  function resetScores() {
    setScores(EMPTY_SCORES)
    reset()
  }

  const turnLabel =
    mode === 'cpu'
      ? turn === 'R'
        ? 'Your turn'
        : 'CPU thinking…'
      : turn === 'R'
        ? 'Red'
        : 'Yellow'

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip
        label={`Red: ${scores.R}`}
        sx={{ bgcolor: '#dc2626', color: 'white' }}
      />
      <Chip
        label={`Yellow: ${scores.Y}`}
        sx={{ bgcolor: '#eab308', color: '#111' }}
      />
      <Chip label={`Draws: ${scores.draws}`} variant="outlined" />
      <Chip
        color={
          over ? (winner ? 'primary' : 'default') : 'secondary'
        }
        label={
          over
            ? winner
              ? `${winner === 'R' ? 'Red' : 'Yellow'} wins!`
              : 'Draw'
            : turnLabel
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
            p: { xs: 1.5, md: 2.5 },
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            flex: 1,
            width: '100%',
          }}
        >
          <Box
            sx={{
              maxWidth: 560,
              mx: 'auto',
              p: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%)',
              boxShadow: 'inset 0 4px 14px rgba(0,0,0,.3)',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: 0.8,
              }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const clickable = !over && board[0][c] === null
                  const ghost =
                    !cell &&
                    hoverCol === c &&
                    !over &&
                    (mode !== 'cpu' || turn === 'R') &&
                    r ===
                      board.findIndex((rr) => rr[c] !== null) - 1 ||
                    (!cell &&
                      hoverCol === c &&
                      !over &&
                      (mode !== 'cpu' || turn === 'R') &&
                      board.every((rr) => rr[c] === null) &&
                      r === ROWS - 1)
                  const isWin = winCells.has(`${r}-${c}`)
                  return (
                    <Box
                      key={`${r}-${c}`}
                      onClick={() => clickable && play(c)}
                      onMouseEnter={() => setHoverCol(c)}
                      onMouseLeave={() => setHoverCol(null)}
                      sx={{
                        aspectRatio: '1 / 1',
                        borderRadius: '50%',
                        bgcolor: cell
                          ? cell === 'R'
                            ? '#dc2626'
                            : '#eab308'
                          : 'rgba(0,0,0,.35)',
                        boxShadow: isWin
                          ? '0 0 0 3px #fff, 0 0 18px rgba(255,255,255,.6)'
                          : cell
                            ? 'inset 0 -6px 0 rgba(0,0,0,.25)'
                            : 'inset 0 4px 8px rgba(0,0,0,.6)',
                        cursor: clickable ? 'pointer' : 'default',
                        opacity: ghost ? 0.55 : 1,
                        transition: 'background 150ms, opacity 120ms',
                        outline: ghost
                          ? `3px dashed ${turn === 'R' ? '#fca5a5' : '#fde68a'}`
                          : 'none',
                        outlineOffset: -4,
                      }}
                    />
                  )
                }),
              )}
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
            <Box>
              <Typography variant="caption" color="text.secondary">
                Opponent
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={mode}
                size="small"
                onChange={(_, v) => {
                  if (v) {
                    setMode(v)
                    reset()
                  }
                }}
                sx={{ mt: 0.5 }}
              >
                <ToggleButton value="cpu">vs CPU</ToggleButton>
                <ToggleButton value="pvp">2 Players</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {mode === 'cpu' && (
              <FormControl size="small">
                <InputLabel id="c4-diff">Difficulty</InputLabel>
                <Select
                  labelId="c4-diff"
                  label="Difficulty"
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value as Difficulty)
                    reset()
                  }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            )}
            <Button variant="contained" onClick={reset}>
              New round
            </Button>
            <Button color="inherit" onClick={resetScores}>
              Reset scores
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
