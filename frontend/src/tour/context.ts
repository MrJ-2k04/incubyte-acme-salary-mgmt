import { createContext, useContext } from 'react'

export const StartTourContext = createContext<() => void>(() => {})

export function useStartTour() {
  return useContext(StartTourContext)
}
