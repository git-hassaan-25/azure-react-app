import {
  Box,
  Breadcrumbs,
  Chip,
  IconButton,
  Link as MuiLink,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import type { GameMeta } from '../games/registry'
import type { ReactNode } from 'react'

interface Props {
  meta: GameMeta
  onRestart?: () => void
  status?: ReactNode
  children: ReactNode
}

export function GameShell({ meta, onRestart, status, children }: Props) {
  const navigate = useNavigate()
  const Icon = meta.icon

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <IconButton
          onClick={() => navigate('/')}
          aria-label="back to home"
          sx={{
            bgcolor: 'background.paper',
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Breadcrumbs>
          <MuiLink component={RouterLink} to="/" underline="hover" color="inherit">
            Home
          </MuiLink>
          <Typography color="text.primary" fontWeight={600}>
            {meta.title}
          </Typography>
        </Breadcrumbs>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          background: (t) =>
            t.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${meta.accent}22, transparent 60%)`
              : `linear-gradient(135deg, ${meta.accent}1c, transparent 60%)`,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          spacing={2}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              color: 'white',
              boxShadow: `0 10px 24px ${meta.accent}55`,
              background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}bb)`,
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">{meta.title}</Typography>
            <Typography color="text.secondary">{meta.description}</Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={meta.difficulty} />
              <Chip size="small" label={`${meta.players} player${meta.players === '1' ? '' : 's'}`} variant="outlined" />
              {meta.tags.map((t) => (
                <Chip key={t} size="small" label={t} variant="outlined" />
              ))}
            </Stack>
          </Box>
          {onRestart && (
            <Tooltip title="Restart">
              <IconButton
                onClick={onRestart}
                sx={{
                  bgcolor: 'background.paper',
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {status && <Box sx={{ mt: 2.5 }}>{status}</Box>}
      </Paper>

      <Box>{children}</Box>
    </Stack>
  )
}
