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
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Cell = 'X' | 'O' | null
type Board = Cell[]
type Mode = 'cpu' | 'pvp'
type Difficulty = 'easy' | 'medium' | 'hard'

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function winnerInfo(b: Board): { winner: Cell; line: number[] | null } {
  for (const line of LINES) {
    const [a, b1, c] = line
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { winner: b[a], line }
    }
  }
  return { winner: null, line: null }
}

function isDraw(b: Board) {
  return b.every(Boolean) && !winnerInfo(b).winner
}

function minimax(
  b: Board,
  player: 'X' | 'O',
  ai: 'X' | 'O',
): { score: number; index: number } {
  const { winner } = winnerInfo(b)
  if (winner === ai) return { score: 10, index: -1 }
  if (winner && winner !== ai) return { score: -10, index: -1 }
  if (isDraw(b)) return { score: 0, index: -1 }

  const moves: { score: number; index: number }[] = []
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      const next = b.slice()
      next[i] = player
      const { score } = minimax(next, player === 'X' ? 'O' : 'X', ai)
      moves.push({ score, index: i })
    }
  }
  const pick =
    player === ai
      ? moves.reduce((a, c) => (c.score > a.score ? c : a))
      : moves.reduce((a, c) => (c.score < a.score ? c : a))
  return pick
}

function randomEmpty(b: Board) {
  const empties = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)
  return empties[Math.floor(Math.random() * empties.length)]
}

function bestMove(b: Board, ai: 'X' | 'O', difficulty: Difficulty): number {
  if (difficulty === 'easy') return randomEmpty(b)
  if (difficulty === 'medium' && Math.random() < 0.45) return randomEmpty(b)
  return minimax(b, ai, ai).index
}

interface Scores {
  X: number
  O: number
  draws: number
}

const EMPTY: Board = Array(9).fill(null)

export default function TicTacToe() {
  const meta = gameBySlug('tic-tac-toe')!
  const [mode, setMode] = useState<Mode>('cpu')
  const [difficulty, setDifficulty] = useState<Difficulty>('hard')
  const [board, setBoard] = useState<Board>(EMPTY)
  const [turn, setTurn] = useState<'X' | 'O'>('X')
  const [scores, setScores] = useLocalStorage<Scores>('ttt-scores', {
    X: 0,
    O: 0,
    draws: 0,
  })

  const { winner, line } = useMemo(() => winnerInfo(board), [board])
  const draw = !winner && isDraw(board)
  const over = Boolean(winner) || draw

  useEffect(() => {
    if (!over) return
    if (winner) {
      setScores((s) => ({ ...s, [winner]: s[winner] + 1 }))
    } else if (draw) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }))
    }
  }, [over])

  useEffect(() => {
    if (mode !== 'cpu' || over || turn !== 'O') return
    const id = setTimeout(() => {
      const idx = bestMove(board, 'O', difficulty)
      if (idx >= 0) {
        setBoard((b) => {
          if (b[idx]) return b
          const next = b.slice()
          next[idx] = 'O'
          return next
        })
        setTurn('X')
      }
    }, 420)
    return () => clearTimeout(id)
  }, [turn, mode, board, over, difficulty])

  function play(i: number) {
    if (over || board[i]) return
    if (mode === 'cpu' && turn === 'O') return
    const next = board.slice()
    next[i] = turn
    setBoard(next)
    setTurn(turn === 'X' ? 'O' : 'X')
  }

  function reset() {
    setBoard(EMPTY)
    setTurn('X')
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 })
    reset()
  }

  const status = (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5}>
      <Chip
        color={winner === 'X' ? 'success' : 'default'}
        label={`X: ${scores.X}`}
      />
      <Chip
        color={winner === 'O' ? 'success' : 'default'}
        label={`O: ${scores.O}`}
      />
      <Chip label={`Draws: ${scores.draws}`} variant="outlined" />
      <Chip
        color={over ? (winner ? 'primary' : 'default') : 'secondary'}
        label={
          over
            ? winner
              ? `${winner} wins!`
              : "It's a draw"
            : `${turn}'s turn`
        }
      />
    </Stack>
  )

  return (
    <GameShell meta={meta} onRestart={reset} status={status}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ md: 'flex-start' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            flex: 1,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              aspectRatio: '1 / 1',
              maxWidth: 460,
              mx: 'auto',
            }}
          >
            {board.map((cell, i) => {
              const isWinning = line?.includes(i)
              return (
                <Button
                  key={i}
                  onClick={() => play(i)}
                  disabled={Boolean(cell) || over}
                  sx={{
                    minWidth: 0,
                    height: '100%',
                    aspectRatio: '1 / 1',
                    fontSize: 56,
                    borderRadius: 3,
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255,255,255,.03)'
                        : 'rgba(0,0,0,.03)',
                    border: (t) =>
                      `1px solid ${isWinning ? t.palette.success.main : t.palette.divider}`,
                    color: cell === 'X' ? 'primary.main' : 'secondary.main',
                    transition: 'all 200ms',
                    '&:hover:not(:disabled)': {
                      bgcolor: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255,255,255,.06)'
                          : 'rgba(0,0,0,.05)',
                    },
                    '&.Mui-disabled': {
                      color:
                        cell === 'X'
                          ? 'primary.main'
                          : cell === 'O'
                            ? 'secondary.main'
                            : undefined,
                    },
                  }}
                >
                  {cell === 'X' && (
                    <CloseRoundedIcon
                      sx={{ fontSize: 80, animation: 'popIn 250ms ease' }}
                    />
                  )}
                  {cell === 'O' && (
                    <RadioButtonUncheckedRoundedIcon
                      sx={{ fontSize: 68, animation: 'popIn 250ms ease' }}
                    />
                  )}
                </Button>
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
            <Box>
              <Typography variant="caption" color="text.secondary">
                Opponent
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                fullWidth
                onChange={(_, v) => {
                  if (v) {
                    setMode(v)
                    reset()
                  }
                }}
                size="small"
                sx={{ mt: 0.5 }}
              >
                <ToggleButton value="cpu">vs CPU</ToggleButton>
                <ToggleButton value="pvp">2 Players</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {mode === 'cpu' && (
              <FormControl size="small">
                <InputLabel id="diff-label">Difficulty</InputLabel>
                <Select
                  labelId="diff-label"
                  label="Difficulty"
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value as Difficulty)
                    reset()
                  }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard (unbeatable)</MenuItem>
                </Select>
              </FormControl>
            )}

            <Button onClick={reset} variant="contained">
              New round
            </Button>
            <Button onClick={resetScores} color="inherit">
              Reset scores
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
