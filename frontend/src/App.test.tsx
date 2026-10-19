import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_PATH } from './api/client'
import App from './App'
import { page, referenceHandler, url } from './test/fixtures'
import { renderWithProviders } from './test/render'
import { server } from './test/server'

describe('App', () => {
  it('shows the product name and links to both screens', async () => {
    server.use(referenceHandler, http.get(url(API_PATH.employees), () => HttpResponse.json(page([]))))
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { name: 'ACME Salary Management' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Employees' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Insights' })).toBeInTheDocument()
  })
})
