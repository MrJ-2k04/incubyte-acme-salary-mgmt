import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('shows the product name and a sidebar with the dashboard first', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { name: 'ACME Salary Management' })).toBeInTheDocument()
    const links = within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link')
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Dashboard', '/'],
      ['Employees', '/employees'],
    ])
  })

  it('opens on the dashboard and marks it in the sidebar', async () => {
    renderWithProviders(<App />)

    // The dashboard is a lazy chunk, and loading the chart library can take a moment.
    expect(await screen.findByRole('heading', { name: 'Dashboard' }, { timeout: 5000 })).toBeInTheDocument()
    const sidebar = screen.getByRole('navigation', { name: 'Main' })
    expect(within(sidebar).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
    expect(within(sidebar).getByRole('link', { name: 'Employees' })).not.toHaveAttribute('aria-current')
  })

  it('follows the system theme until someone picks light or dark', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    const theme = screen.getByRole('group', { name: 'Theme' })
    expect(within(theme).getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(within(theme).getByRole('button', { name: 'Dark' }))

    expect(within(theme).getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(theme).getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows who is signed in at the foot of the sidebar', () => {
    renderWithProviders(<App />)

    const sidebar = screen.getByRole('complementary', { name: 'Sidebar' })
    expect(within(sidebar).getByText('HR Manager')).toBeInTheDocument()
    expect(within(sidebar).getByRole('group', { name: 'Theme' })).toBeInTheDocument()
  })
})
