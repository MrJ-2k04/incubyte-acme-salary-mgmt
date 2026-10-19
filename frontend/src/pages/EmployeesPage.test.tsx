import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { API_PATH } from '../api/client'
import { asha, page, referenceHandler, url } from '../test/fixtures'
import { renderWithProviders } from '../test/render'
import { server } from '../test/server'
import EmployeesPage from './EmployeesPage'

let lastListUrl: URL

beforeEach(() => {
  server.use(
    referenceHandler,
    http.get(url(API_PATH.employees), ({ request }) => {
      lastListUrl = new URL(request.url)
      return HttpResponse.json(page([asha]))
    }),
  )
})

describe('EmployeesPage', () => {
  it('lists employees with salary in their own currency', async () => {
    renderWithProviders(<EmployeesPage />)

    const row = (await screen.findByText('Asha Rao')).closest('tr')!
    expect(within(row).getByText('₹2,400,000')).toBeInTheDocument()
  })

  it('sends the search text and filters to the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EmployeesPage />)
    await screen.findByText('Asha Rao')

    await user.type(screen.getByLabelText('Search name or email'), 'asha')
    await user.selectOptions(screen.getByLabelText('Country'), 'IN')

    await waitFor(() => {
      expect(lastListUrl.searchParams.get('q')).toBe('asha')
      expect(lastListUrl.searchParams.get('country')).toBe('IN')
    })
  })

  it('starts from the filters given in the address', async () => {
    renderWithProviders(<EmployeesPage />, { route: '/employees?country=IN&job_title=Software+Engineer' })
    await screen.findByText('Asha Rao')

    expect(lastListUrl.searchParams.get('country')).toBe('IN')
    expect(lastListUrl.searchParams.get('job_title')).toBe('Software Engineer')
    expect(screen.getByLabelText('Country')).toHaveValue('IN')
  })

  it('adds an employee through the form', async () => {
    const user = userEvent.setup()
    let posted: unknown
    server.use(
      http.post(url(API_PATH.employees), async ({ request }) => {
        posted = await request.json()
        return HttpResponse.json({ ...asha, id: 2 }, { status: 201 })
      }),
    )
    renderWithProviders(<EmployeesPage />)

    await user.click(await screen.findByRole('button', { name: 'Add employee' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/^Full name/), 'Ben Clark')
    await user.type(within(dialog).getByLabelText(/^Email/), 'ben@acmecorp.com')
    await user.selectOptions(within(dialog).getByLabelText(/^Job title/), 'Accountant')
    await user.selectOptions(within(dialog).getByLabelText(/^Department/), 'Finance')
    await user.selectOptions(within(dialog).getByLabelText(/^Country/), 'US')
    await user.type(within(dialog).getByLabelText(/^Annual salary/), '90000')
    await user.type(within(dialog).getByLabelText(/^Hire date/), '2024-02-01')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(posted).toEqual({
      full_name: 'Ben Clark',
      email: 'ben@acmecorp.com',
      job_title: 'Accountant',
      department: 'Finance',
      country_code: 'US',
      salary: 90000,
      hired_on: '2024-02-01',
    })
  })

  it('shows the reason when the API rejects a save', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch(url(API_PATH.employee(asha.id)), () =>
        HttpResponse.json({ detail: 'Email is already in use' }, { status: 409 }),
      ),
    )
    renderWithProviders(<EmployeesPage />)

    await user.click(await screen.findByRole('button', { name: 'Edit Asha Rao' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Email is already in use')).toBeInTheDocument()
  })

  it('archives an employee', async () => {
    const user = userEvent.setup()
    let archived = false
    server.use(
      http.post(url(API_PATH.archive(asha.id)), () => {
        archived = true
        return HttpResponse.json({ ...asha, archived_at: '2026-01-01T00:00:00' })
      }),
    )
    renderWithProviders(<EmployeesPage />)

    await user.click(await screen.findByRole('button', { name: 'Archive Asha Rao' }))

    await waitFor(() => expect(archived).toBe(true))
  })

  it('links export to the current filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EmployeesPage />)
    await screen.findByText('Asha Rao')

    await user.selectOptions(screen.getByLabelText('Country'), 'IN')

    const href = new URL(screen.getByRole('link', { name: 'Export CSV' }).getAttribute('href')!)
    expect(href.pathname).toBe(API_PATH.export)
    expect(href.searchParams.get('country')).toBe('IN')
  })

  it('imports a csv file and reports rejected lines', async () => {
    const user = userEvent.setup()
    let contentType = ''
    server.use(
      http.post(url(API_PATH.import), async ({ request }) => {
        // Reading a jsdom File body through MSW hangs, so only the upload type is checked here.
        contentType = request.headers.get('content-type') ?? ''
        return HttpResponse.json({
          imported: 2,
          rejected: [{ line: 3, errors: ['salary: Input should be greater than 0'] }],
        })
      }),
    )
    renderWithProviders(<EmployeesPage />)
    await screen.findByText('Asha Rao')

    const file = new File(['full_name,email\n'], 'staff.csv', { type: 'text/csv' })
    await user.upload(screen.getByLabelText('Import CSV'), file)

    expect(await screen.findByText('Imported 2 employees. 1 line rejected.')).toBeInTheDocument()
    expect(screen.getByText('Line 3: salary: Input should be greater than 0')).toBeInTheDocument()
    expect(contentType).toContain('multipart/form-data')
  })

  it('explains why a whole file was refused', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(url(API_PATH.import), () =>
        HttpResponse.json({ detail: 'Missing columns: salary' }, { status: 422 }),
      ),
    )
    renderWithProviders(<EmployeesPage />)
    await screen.findByText('Asha Rao')

    await user.upload(screen.getByLabelText('Import CSV'), new File(['x'], 'bad.csv', { type: 'text/csv' }))

    expect(await screen.findByText('Missing columns: salary')).toBeInTheDocument()
  })
})
