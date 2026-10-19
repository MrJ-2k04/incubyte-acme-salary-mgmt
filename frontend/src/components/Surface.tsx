import Paper, { type PaperProps } from '@mui/material/Paper'

export default function Surface({ sx, ...props }: PaperProps) {
  return (
    <Paper
      variant="outlined"
      sx={[{ borderRadius: 3, overflow: 'hidden', position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    />
  )
}
