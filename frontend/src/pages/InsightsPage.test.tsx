import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { API_PATH } from '../api/client'
import type { CountryInsight } from '../api/types'
import { url } from '../test/fixtures'
import { renderWithProviders } from '../test/render'
import { server } from '../test/server'
import InsightsPage from './InsightsPage'

const india: CountryInsight = {
  country_code: 'IN',
  country_name: 'India',
  currency: 'INR',
  headcount: 3,
  min_salary: 1000000,
  max_salary: 3000000,
  avg_salary: 2000000,
  avg_salary_usd: 24000,
}

beforeEach(() => {
  server.use(
    http.get(url(API_PATH.insightsSummary), () =>
      HttpResponse.json({ headcount: 9691, countries: 10, total_payroll_usd: 755108661, avg_salary_usd: 77919 }),
    ),
    http.get(url(API_PATH.insightsCountries), () => HttpResponse.json([india])),
    http.get(url(API_PATH.insightsDistribution), () =>
      HttpResponse.json({ currency: 'USD', buckets: [{ lower: 0, upper: 100, count: 5 }] }),
    ),
    http.get(url(API_PATH.insightsJobTitles('IN')), () =>
      HttpResponse.json([
        { job_title: 'Software Engineer', headcount: 2, min_salary: 2000000, max_salary: 3000000, avg_salary: 2500000 },
      ]),
    ),
  )
})

describe('InsightsPage', () => {
  it('shows org-wide totals in USD', async () => {
    renderWithProviders(<InsightsPage />)

    expect(await screen.findByText('9,691')).toBeInTheDocument()
    expect(screen.getByText('$755,108,661')).toBeInTheDocument()
  })

  it('shows pay per country in local currency and USD', async () => {
    renderWithProviders(<InsightsPage />)

    const row = (await screen.findByRole('cell', { name: 'India' })).closest('tr')!
    expect(within(row).getByText('₹2,000,000')).toBeInTheDocument()
    expect(within(row).getByText('$24,000')).toBeInTheDocument()
  })

  it('shows pay by job title for the chosen country', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InsightsPage />)
    await screen.findByRole('cell', { name: 'India' })

    await user.selectOptions(screen.getByLabelText('Country for job titles'), 'IN')

    const row = (await screen.findByRole('cell', { name: 'Software Engineer' })).closest('tr')!
    expect(within(row).getByText('₹2,500,000')).toBeInTheDocument()
  })
})
