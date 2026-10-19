import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

const CREDIT = { name: 'webwizards.in', url: 'https://webwizards.in' }
const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ mt: 'auto', px: { xs: 2, md: 4 }, py: 2.5, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}
    >
      <Typography variant="caption" color="text.secondary">
        © {YEAR}{' '}
        <Link href={CREDIT.url} target="_blank" rel="noopener" color="inherit" underline="hover" sx={{ fontWeight: 600 }}>
          {CREDIT.name}
        </Link>
        . All rights reserved.
      </Typography>
    </Box>
  )
}
