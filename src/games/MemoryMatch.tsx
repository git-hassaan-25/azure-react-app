import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { GameShell } from '../components/GameShell'
import { gameBySlug } from './registry'
import { useLocalStorage } from '../hooks/useLocalStorage'

const EMOJI_POOL = [
  '🍕', '🍔', '🍎', '🍉', '🍇', '🍓', '🥑', '🍍',
  '🌮', '🍣', '🍩', '🍪', '🍰', '🥐', '🧁', '🍓',
  '⚽', '🏀', '🎲', '🎯',
]

type Difficulty = 'easy' | 'medium' | 'hard'

const CONFIG: Record<
  Difficulty,
  { pairs: number; cols: number; label: string }
> = {
  easy: { pairs: 6, cols: 4, label: '4 × 3' },
  medium: { pairs: 8, cols: 4, label: '4 × 4' },
  hard: { pairs: 10, cols: 5, label: '5 × 4' },
}

interface Card {
  id: number
  emoji: string
  matched: boolean
  flipped: boolean
}

function buildDeck(pairs: number): Card[] {
  const picked = [...EMOJI_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, pairs)
  const deck = [...picked, ...picked]
    .sort(() => Math.random() - 0.5)
    .map((emoji, id) => ({ id, emoji, matched: false, flipped: false }))
  return deck
}

export default function MemoryMatch() {
  const meta = gameBySlug('memory-match')!
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [deck, setDeck] = useState<Card[]>(() =>
    buildDeck(CONFIG['medium'].pairs),
  )
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<number | null>(null)

  const [bestMoves, setBestMoves] = useLocalStorage<Record<Difficulty, number | null>>(
    'mm-best-moves',
    { easy: null, medium: null, hard: null },
  )

  const matchedCount = useMemo(
    () => deck.filter((c) => c.matched).length,
    [deck],
  )
  const totalCards = CONFIG[difficulty].pairs * 2
  const done = matchedCount === totalCards && totalCards > 0

  useEffect(() => {
    if (startedAt === null || done) {
      if (timerRef.current) window.clearInterval(timerRef.current)
      return
    }
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 250)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [startedAt, done])

  useEffect(() => {
    if (!done) return
    setBestMoves((prev) => {
      const current = prev[difficulty]
      if (current === null || moves < current) {
        return { ...prev, [difficulty]: moves }
      }
      return prev
    })
  }, [done])

  function handleClick(index: number) {
    const card = deck[index]
    if (card.flipped || card.matched) return
    if (selected.length === 2) return

    if (startedAt === null) setStartedAt(Date.now())

    const nextDeck = deck.slice()
    nextDeck[index] = { ...card, flipped: true }
    const nextSelected = [...selected, index]
    setDeck(nextDeck)
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = nextSelected
      if (nextDeck[a].emoji === nextDeck[b].emoji) {
        window.setTimeout(() => {
          setDeck((d) => {
            const copy = d.slice()
            copy[a] = { ...copy[a], matched: true }
            copy[b] = { ...copy[b], matched: true }
            return copy
          })
          setSelected([])
        }, 420)
      } else {
        window.setTimeout(() => {
          setDeck((d) => {
            const copy = d.slice()
            copy[a] = { ...copy[a], flipped: false }
            copy[b] = { ...copy[b], flipped: false }
            return copy
          })
          setSelected([])
        }, 900)
      }
    }
  }

  function reset(next: Difficulty = difficulty) {
    setDifficulty(next)
    setDeck(buildDeck(CONFIG[next].pairs))
    setSelected([])
    setMoves(0)
    setStartedAt(null)
    setElapsed(0)
  }

  const best = bestMoves[difficulty]

  const status = (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <Chip label={`Moves: ${moves}`} color="primary" />
      <Chip label={`Time: ${elapsed}s`} />
      <Chip
        label={`Matched: ${matchedCount / 2}/${totalCards / 2}`}
        variant="outlined"
      />
      <Chip
        label={`Best (${CONFIG[difficulty].label}): ${best ?? '—'}`}
        variant="outlined"
      />
      {done && <Chip color="success" label="Cleared! 🎉" />}
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
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: (t) => `1px solid ${t.palette.divider}`,
            flex: 1,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${CONFIG[difficulty].cols}, 1fr)`,
              gap: 1.2,
              maxWidth: 520,
              mx: 'auto',
            }}
          >
            {deck.map((card, i) => {
              const revealed = card.flipped || card.matched
              return (
                <Box
                  key={card.id}
                  onClick={() => handleClick(i)}
                  sx={{
                    perspective: 800,
                    aspectRatio: '3 / 4',
                    cursor: revealed ? 'default' : 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 400ms',
                      transformStyle: 'preserve-3d',
                      transform: revealed ? 'rotateY(180deg)' : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 2.5,
                        backfaceVisibility: 'hidden',
                        background:
                          'linear-gradient(135deg, #6C4BFF, #FF4B8B)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: 26,
                        boxShadow: '0 8px 20px rgba(108,75,255,.25)',
                      }}
                    >
                      ?
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 2.5,
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        bgcolor: 'background.paper',
                        border: (t) =>
                          `2px solid ${card.matched ? t.palette.success.main : t.palette.divider}`,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: { xs: 32, sm: 40 },
                        opacity: card.matched ? 0.85 : 1,
                      }}
                    >
                      {card.emoji}
                    </Box>
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
            <Box>
              <Typography variant="caption" color="text.secondary">
                Grid size
              </Typography>
              <ToggleButtonGroup
                value={difficulty}
                exclusive
                fullWidth
                onChange={(_, v) => v && reset(v)}
                size="small"
                sx={{ mt: 0.5 }}
              >
                <ToggleButton value="easy">4×3</ToggleButton>
                <ToggleButton value="medium">4×4</ToggleButton>
                <ToggleButton value="hard">5×4</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Button variant="contained" onClick={() => reset()}>
              Shuffle & restart
            </Button>
            <Typography variant="body2" color="text.secondary">
              Flip two cards at a time. Match every pair using as few moves as
              possible.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </GameShell>
  )
}
