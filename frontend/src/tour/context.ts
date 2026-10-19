import { createContext, useContext } from 'react'
import type { TourStep } from './steps'

type Tour = { start: () => void; target: TourStep['target'] }

export const TourContext = createContext<Tour>({ start: () => {}, target: undefined })

export function useStartTour() {
  return useContext(TourContext).start
}

// Lets a part of the page open itself while the tour is pointing at it.
export function useTourTarget() {
  return useContext(TourContext).target
}
