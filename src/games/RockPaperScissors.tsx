import { useState } from 'react'
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

type Move = 'rock' | 'paper' | 'scissors'
type Outcome = 'win' | 'lose' | 'draw'

const MOVES: { key: Move; label: string; emoji: string; beats: Move }[] = [
  { key: 'rock', label: 'Rock', emoji: '🪨', beats: 'scissors' },
  { key: 'paper', label: 'Paper', emoji: '📄', beats: 'rock' },
  { key: 'scissors', label: 'Scissors', emoji: '✂️', beats: 'paper' },
]

function decide(player: Move, cpu: Move): Outcome {
  if (player === cpu) return 'draw'
  return MOVES.find((m) => m.key === player)!.beats === cpu ? 'win' : 'lose'
}

interface Record {
  wins: number
  losses: number
  draws: number
  streak: number
  bestStreak: number
}

const EMPTY: Record = {
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
}

export default function RockPaperScissors() {
  const meta = gameBySlug('rock-paper-scissors')!
  const [player, setPlayer] = useState<Move | null>(null)
  const [cpu, setCpu] = useState<Move | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [rolling, setRolling] = useState(false)
  const [record, setRecord] = useLocalStorage<Record>('rps-record', EMPTY)

  function play(move: Move) {
    if (rolling) return
    setPlayer(move)
    setCpu(null)
    setOutcome(null)
    setRolling(true)

    let i = 0
    const frames = 8
    const tick = () => {
      setCpu(MOVES[i % 3].key)
      i++
      if (i < frames) {
        window.setTimeout(tick, 60 + i * 12)
      } else {
        const final = MOVES[Math.floor(Math.random() * 3)].key
        setCpu(final)
        const result = decide(move, final)
        setOutcome(result)
        setRecord((r) => {
          const next = { ...r }
          if (result === 'win') {
            next.wins += 1
            next.streak = r.streak >= 0 ? r.streak + 1 : 1
          } else if (result === 'lose') {
            next.losses += 1
            next.streak = r.streak <= 0 ? r.streak - 1 : -1
          } else {
            next.draws += 1
          }
          next.bestStreak = Math.max(r.bestStreak, next.streak)
          return next
        })
        setRolling(false)
      }
    }
    tick()
  }

  const outcomeLabel =
    outcome === 'win'
      ? 'You win!'
      : outcome === 'lose'
        ? 'CPU wins'
        : outcome === 'draw'
          ? 'Draw'
          : 'Choose your move'

  const outcomeColor =
    outcome === 'win'
      ? 'success.main'
      : outcome === 'lose'
        ? 'error.main'
        : 'text.primary'

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip color="success" label={`Wins: ${record.wins}`} />
      <Chip color="error" label={`Losses: ${record.losses}`} />
      <Chip label={`Draws: ${record.draws}`} variant="outlined" />
      <Chip
        label={`Streak: ${record.streak}`}
        color={record.streak > 0 ? 'primary' : 'default'}
      />
      <Chip label={`Best streak: ${record.bestStreak}`} variant="outlined" />
    </Stack>
  )

  return (
    <GameShell
      meta={meta}
      onRestart={() => setRecord(EMPTY)}
      status={status}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="center"
          alignItems="center"
          spacing={{ xs: 2, sm: 6 }}
          sx={{ mb: 3 }}
        >
          <PlayerSlot label="You" move={player} />
          <Typography variant="h3" sx={{ color: outcomeColor }}>
            {outcome === 'win' ? '✓' : outcome === 'lose' ? '✗' : 'vs'}
          </Typography>
          <PlayerSlot label="CPU" move={cpu} flipped />
        </Stack>

        <Typography
          variant="h5"
          align="center"
          sx={{ color: outcomeColor, minHeight: 40 }}
        >
          {outcomeLabel}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
          flexWrap="wrap"
          useFlexGap
        >
          {MOVES.map((m) => (
            <Button
              key={m.key}
              onClick={() => play(m.key)}
              disabled={rolling}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 4,
                fontSize: 44,
                flexDirection: 'column',
                bgcolor: 'background.paper',
                border: (t) => `1px solid ${t.palette.divider}`,
                '&:hover:not(:disabled)': {
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.main',
                  boxShadow: '0 12px 24px rgba(108,75,255,.2)',
                },
                transition: 'all 200ms',
              }}
            >
              <span>{m.emoji}</span>
              <Typography
                variant="caption"
                sx={{ mt: 0.5, color: 'text.primary' }}
              >
                {m.label}
              </Typography>
            </Button>
          ))}
        </Stack>
      </Paper>
    </GameShell>
  )
}

function PlayerSlot({
  label,
  move,
  flipped,
}: {
  label: string
  move: Move | null
  flipped?: boolean
}) {
  const emoji = move ? MOVES.find((m) => m.key === move)!.emoji : '❔'
  return (
    <Stack alignItems="center" spacing={1}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Box
        sx={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: 72,
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255,255,255,.05)'
              : 'rgba(0,0,0,.04)',
          border: (t) => `2px dashed ${t.palette.divider}`,
          transform: flipped ? 'scaleX(-1)' : 'none',
          animation: move ? 'popIn 300ms ease' : undefined,
        }}
      >
        {emoji}
      </Box>
    </Stack>
  )
}
