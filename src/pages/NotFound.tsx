import { Button, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'

export default function NotFound() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 8 },
        borderRadius: 5,
        border: (t) => `1px solid ${t.palette.divider}`,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 72, color: 'primary.main' }} />
        <Typography variant="h3">404</Typography>
        <Typography color="text.secondary">
          The page you’re looking for can’t be found.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large">
          Back to home
        </Button>
      </Stack>
    </Paper>
  )
}
