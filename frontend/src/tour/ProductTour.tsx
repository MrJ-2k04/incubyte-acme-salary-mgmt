import CloseRounded from '@mui/icons-material/CloseRounded'
import ExploreOutlined from '@mui/icons-material/ExploreOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { StartTourContext } from './context'
import { TOUR_SEEN_KEY, TOUR_STEPS, type TourStep } from './steps'

const SPOTLIGHT_PADDING = 8
const CARD_WIDTH = 340
const CARD_HEIGHT_ESTIMATE = 230
const CARD_GAP = 16
const VIEWPORT_MARGIN = 16
const DIM = 'rgba(0 0 0 / 0.55)'
const MOVE = '300ms cubic-bezier(0.4, 0, 0.2, 1)'

type Rect = { top: number; left: number; width: number; height: number }

const sameRect = (a?: Rect, b?: Rect) =>
  a?.top === b?.top && a?.left === b?.left && a?.width === b?.width && a?.height === b?.height

function useTargetRect(target: TourStep['target']): Rect | undefined {
  // Each rect remembers its target, so a new step never shows the last step's spotlight.
  const [measured, setMeasured] = useState<{ target: string; rect: Rect }>()

  useLayoutEffect(() => {
    if (!target) return
    const selector = `[data-tour="${target}"]`
    let element: Element | null = null

    const measure = () => {
      if (!element) return
      const { top, left, width, height } = element.getBoundingClientRect()
      const rect = { top, left, width, height }
      setMeasured((current) =>
        current?.target === target && sameRect(current.rect, rect) ? current : { target, rect },
      )
    }
    const findOrMeasure = () => {
      if (element) return measure()
      element = document.querySelector(selector)
      if (!element) return
      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
      measure()
    }

    // The target can live on a page that is still loading, so keep looking as the page changes.
    const observer = new MutationObserver(findOrMeasure)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    findOrMeasure()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [target])

  return measured && measured.target === target ? measured.rect : undefined
}

// Prefers the right of narrow targets like the sidebar, then below, then above.
function cardPlacement(rect?: Rect) {
  if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  const { innerWidth, innerHeight } = window
  const maxLeft = innerWidth - CARD_WIDTH - VIEWPORT_MARGIN
  const maxTop = innerHeight - CARD_HEIGHT_ESTIMATE - VIEWPORT_MARGIN
  const clamp = (value: number, max: number) => Math.max(VIEWPORT_MARGIN, Math.min(value, max))
  const right = rect.left + rect.width + SPOTLIGHT_PADDING + CARD_GAP

  if (rect.width < CARD_WIDTH && right + CARD_WIDTH < innerWidth) {
    return { top: clamp(rect.top, maxTop), left: right, transform: 'none' }
  }
  const below = rect.top + rect.height + SPOTLIGHT_PADDING + CARD_GAP
  const top = below + CARD_HEIGHT_ESTIMATE < innerHeight ? below : rect.top - SPOTLIGHT_PADDING - CARD_GAP - CARD_HEIGHT_ESTIMATE
  return { top: clamp(top, maxTop), left: clamp(rect.left, maxLeft), transform: 'none' }
}

type CardProps = { index: number; onStep: (index: number) => void; onFinish: () => void }

function TourCard({ index, onStep, onFinish }: CardProps) {
  const step = TOUR_STEPS[index]
  const first = index === 0
  const last = index === TOUR_STEPS.length - 1
  const titleId = useId()
  const card = useRef<HTMLDivElement>(null)
  const rect = useTargetRect(step.target)

  useEffect(() => card.current?.focus(), [index])

  const next = () => (last ? onFinish() : onStep(index + 1))
  const back = () => !first && onStep(index - 1)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFinish()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <Box sx={(theme) => ({ position: 'fixed', inset: 0, zIndex: theme.zIndex.tooltip + 1 })}>
      {rect ? (
        <Box
          sx={{
            position: 'fixed',
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            borderRadius: 3,
            boxShadow: `0 0 0 9999px ${DIM}`,
            outline: 2,
            outlineColor: 'primary.main',
            outlineOffset: 2,
            transition: `all ${MOVE}`,
            pointerEvents: 'none',
          }}
        />
      ) : (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: DIM, transition: `background-color ${MOVE}` }} />
      )}

      <Paper
        ref={card}
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
        elevation={24}
        sx={{
          position: 'fixed',
          width: CARD_WIDTH,
          maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
          p: 2.5,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          outline: 'none',
          transition: `top ${MOVE}, left ${MOVE}`,
          ...cardPlacement(rect),
        }}
      >
        <Fade in key={index} timeout={250}>
          <div>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              {first ? (
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)',
                  }}
                >
                  <ExploreOutlined fontSize="small" />
                </Box>
              ) : (
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {`Step ${index} of ${TOUR_STEPS.length - 1}`}
                </Typography>
              )}
              <IconButton size="small" aria-label="Skip tour" onClick={onFinish} sx={{ mr: -1 }}>
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>
            <Typography id={titleId} variant="h6" sx={{ mb: 0.75, lineHeight: 1.3 }}>
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step.body}
            </Typography>
          </div>
        </Fade>

        <Stack direction="row" sx={{ alignItems: 'center', mt: 2.5, gap: 1 }}>
          <Stack direction="row" spacing={0.5} aria-hidden sx={{ mr: 'auto' }}>
            {TOUR_STEPS.map((_, dot) => (
              <Box
                key={dot}
                sx={{
                  width: dot === index ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: dot === index ? 'primary.main' : 'divider',
                  transition: `width ${MOVE}, background-color ${MOVE}`,
                }}
              />
            ))}
          </Stack>
          {!first && (
            <Button color="inherit" size="small" onClick={back}>
              Back
            </Button>
          )}
          <Button variant="contained" size="small" onClick={next}>
            {first ? 'Start tour' : last ? 'Finish' : 'Next'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default function ProductTour({ children }: { children: ReactNode }) {
  // A first visit has no record of the tour, so it opens straight away.
  const [index, setIndex] = useState<number | undefined>(() => (localStorage.getItem(TOUR_SEEN_KEY) ? undefined : 0))
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function goTo(next: number) {
    setIndex(next)
    const { route } = TOUR_STEPS[next]
    if (route && route !== pathname) navigate(route)
  }

  function finish() {
    localStorage.setItem(TOUR_SEEN_KEY, 'true')
    setIndex(undefined)
  }

  return (
    <StartTourContext value={() => goTo(0)}>
      {children}
      {index !== undefined && <TourCard index={index} onStep={goTo} onFinish={finish} />}
    </StartTourContext>
  )
}
