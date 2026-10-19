import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { API_PATH } from './api/client'
import App from './App'
import { page, referenceHandler, url } from './test/fixtures'
import { renderWithProviders } from './test/render'
import { server } from './test/server'

beforeEach(() => {
  server.use(referenceHandler, http.get(url(API_PATH.employees), () => HttpResponse.json(page([]))))
})

describe('App', () => {
  it('shows the product name and a sidebar linking to both screens', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { name: 'ACME Salary Management' })).toBeInTheDocument()
    const sidebar = screen.getByRole('navigation', { name: 'Main' })
    expect(within(sidebar).getByRole('link', { name: 'Employees' })).toHaveAttribute('href', '/')
    expect(within(sidebar).getByRole('link', { name: 'Insights' })).toHaveAttribute('href', '/insights')
  })

  it('marks the current screen in the sidebar', () => {
    renderWithProviders(<App />, { route: '/insights' })

    const sidebar = screen.getByRole('navigation', { name: 'Main' })
    expect(within(sidebar).getByRole('link', { name: 'Insights' })).toHaveAttribute('aria-current', 'page')
    expect(within(sidebar).getByRole('link', { name: 'Employees' })).not.toHaveAttribute('aria-current')
  })

  it('offers a switch between light and dark mode', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
  })
})
