import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Grow from '@mui/material/Grow'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTourTarget } from '../tour/context'
import { TOUR_TARGET } from '../tour/steps'
import ThemeModeSwitch from './ThemeModeSwitch'

// The app has no sign-in yet, so the sidebar shows the one person it is built for.
const USER = { name: 'HR Manager', email: 'hr@acmecorp.com', initials: 'HR' }

const MENU_OFFSET = 8

// A popover rather than a modal menu, so the tour can open it and stay usable on top.
export default function AccountMenu() {
  const [row, setRow] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const touring = useTourTarget() === TOUR_TARGET.account
  const shown = open || touring

  return (
    <>
      <Stack ref={setRow} direction="row" spacing={1.25} sx={{ alignItems: 'center', p: 1, borderRadius: 2 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main' }}>
          {USER.initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {USER.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {USER.email}
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label="Account menu"
          aria-haspopup="dialog"
          aria-expanded={shown}
          onClick={() => setOpen((current) => !current)}
          sx={{ border: 1, borderColor: 'divider', borderRadius: '50%' }}
        >
          <MoreHorizRounded fontSize="small" />
        </IconButton>
      </Stack>

      <Popper
        open={shown}
        anchorEl={row}
        placement="top"
        transition
        modifiers={[{ name: 'offset', options: { offset: [0, MENU_OFFSET] } }]}
        // While the tour points here, the menu sits above its dimmed layer so the theme can be picked.
        sx={(theme) => ({ zIndex: touring ? theme.zIndex.tooltip + 2 : theme.zIndex.modal, width: row?.offsetWidth })}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'bottom center' }}>
            <Paper
              role="dialog"
              aria-label="Account"
              data-tour={TOUR_TARGET.account}
              elevation={8}
              onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
              sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}
            >
              <ClickAwayListener
                onClickAway={(event) => {
                  if (!row?.contains(event.target as Node)) setOpen(false)
                }}
              >
                <div>
                  <Box sx={{ px: 2, py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {USER.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {USER.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25 }}>
                    <Typography variant="body2">Theme</Typography>
                    <ThemeModeSwitch />
                  </Stack>
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}
