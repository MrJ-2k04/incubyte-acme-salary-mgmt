import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type Props = { title: string; subtitle?: ReactNode; actions?: ReactNode; actionsTour?: string }

export default function PageHeader({ title, subtitle, actions, actionsTour }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between' }}
    >
      <div>
        <Typography variant="h4" component="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </div>
      {actions && (
        <Stack direction="row" spacing={1} data-tour={actionsTour} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  )
}
