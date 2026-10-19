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

const optionLabels = (select: HTMLElement) => [...(select as HTMLSelectElement).options].map((o) => o.textContent)

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

  it('waits for a pause in typing before searching and keeps the cursor in the box', async () => {
    const user = userEvent.setup()
    const searched: (string | null)[] = []
    server.use(
      http.get(url(API_PATH.employees), ({ request }) => {
        searched.push(new URL(request.url).searchParams.get('q'))
        return HttpResponse.json(page([asha]))
      }),
    )
    renderWithProviders(<EmployeesPage />)
    await screen.findByText('Asha Rao')
    const search = screen.getByLabelText('Search name or email')

    await user.type(search, 'asha')

    expect(search).toHaveFocus()
    expect(search).toHaveValue('asha')
    await waitFor(() => expect(searched).toContain('asha'))
    expect(searched.filter((q) => q && q !== 'asha')).toEqual([])
  })

  it('starts from the filters given in the address', async () => {
    renderWithProviders(<EmployeesPage />, { route: '/employees?country=IN&job_title=Software+Engineer' })
    await screen.findByText('Asha Rao')

    expect(lastListUrl.searchParams.get('country')).toBe('IN')
    expect(lastListUrl.searchParams.get('job_title')).toBe('Software Engineer')
    expect(screen.getByLabelText('Country')).toHaveValue('IN')
  })

  it('filters by department first and offers only its job titles', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EmployeesPage />)
    await screen.findByText('Asha Rao')
    const department = screen.getByLabelText('Department')
    const jobTitle = screen.getByLabelText('Job title')
    expect(department.compareDocumentPosition(jobTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await user.selectOptions(jobTitle, 'Software Engineer')
    await user.selectOptions(department, 'Finance')

    expect(optionLabels(screen.getByLabelText('Job title'))).toEqual(['All job titles', 'Accountant'])
    expect(screen.getByLabelText('Job title')).toHaveValue('')
  })

  it('asks for the department before the job title when adding someone', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EmployeesPage />)

    await user.click(await screen.findByRole('button', { name: 'Add employee' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText(/^Job title/)).toBeDisabled()
    await user.selectOptions(within(dialog).getByLabelText(/^Department/), 'Engineering')

    expect(optionLabels(within(dialog).getByLabelText(/^Job title/))).toEqual(['', 'Software Engineer'])
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
    await user.selectOptions(within(dialog).getByLabelText(/^Department/), 'Finance')
    await user.selectOptions(within(dialog).getByLabelText(/^Job title/), 'Accountant')
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

  it('asks for confirmation before archiving an employee', async () => {
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
    await user.click(within(screen.getByRole('dialog', { name: 'Archive Asha Rao?' })).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(archived).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Archive Asha Rao' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Archive' }))

    await waitFor(() => expect(archived).toBe(true))
  })

  it('offers to undo an archive straight away', async () => {
    const user = userEvent.setup()
    let restored = false
    server.use(
      http.post(url(API_PATH.archive(asha.id)), () =>
        HttpResponse.json({ ...asha, archived_at: '2026-01-01T00:00:00' }),
      ),
      http.post(url(API_PATH.restore(asha.id)), () => {
        restored = true
        return HttpResponse.json(asha)
      }),
    )
    renderWithProviders(<EmployeesPage />)

    await user.click(await screen.findByRole('button', { name: 'Archive Asha Rao' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Archive' }))
    expect(await screen.findByText('Asha Rao archived')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(restored).toBe(true))
  })

  it('shows archived people in their own view', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EmployeesPage />)
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('tab', { name: /^Archived/ }))

    expect(screen.getByRole('tab', { name: /^Archived/ })).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => expect(lastListUrl.searchParams.get('status')).toBe('archived'))
  })

  it('shows how many people are in each view', async () => {
    server.use(
      http.get(url(API_PATH.employees), ({ request }) => {
        const archived = new URL(request.url).searchParams.get('status') === 'archived'
        return HttpResponse.json({ ...page([asha]), total: archived ? 3 : 120 })
      }),
    )
    renderWithProviders(<EmployeesPage />)

    expect(await screen.findByRole('tab', { name: 'Active 120' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Archived 3' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 123' })).toBeInTheDocument()
  })

  it('explains what archiving is for when nobody is archived', async () => {
    server.use(http.get(url(API_PATH.employees), () => HttpResponse.json(page([]))))
    renderWithProviders(<EmployeesPage />, { route: '/employees?status=archived' })

    expect(await screen.findByText('No archived employees')).toBeInTheDocument()
    expect(screen.getByText(/records are kept/)).toBeInTheDocument()
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

  it('previews and applies a pay change to the filtered group', async () => {
    const user = userEvent.setup()
    let previewed: unknown
    let applied: unknown
    server.use(
      http.post(url(API_PATH.raisePreview), async ({ request }) => {
        previewed = await request.json()
        return HttpResponse.json({
          headcount: 2,
          payroll_before_usd: 60000,
          payroll_after_usd: 66000,
          sample: [{ full_name: 'Asha Rao', currency: 'INR', salary: 2000000, new_salary: 2200000 }],
        })
      }),
      http.post(url(API_PATH.raise), async ({ request }) => {
        applied = await request.json()
        return HttpResponse.json({ updated: 2 })
      }),
    )
    renderWithProviders(<EmployeesPage />, { route: '/employees?country=IN' })

    await user.click(await screen.findByRole('button', { name: 'Adjust pay' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^Apply/ })).toBeDisabled()
    await user.type(within(dialog).getByLabelText(/^Change/), '10')

    expect(await within(dialog).findByText('2 active employees')).toBeInTheDocument()
    expect(within(dialog).getByText('$60,000 → $66,000')).toBeInTheDocument()
    expect(within(dialog).getByText('₹2,200,000')).toBeInTheDocument()
    expect(previewed).toEqual({ percent: 10, country: 'IN' })

    await user.click(within(dialog).getByRole('button', { name: 'Apply to 2 employees' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(applied).toEqual({ percent: 10, country: 'IN' })
    expect(await screen.findByText('Changed pay for 2 employees by 10%')).toBeInTheDocument()
  })

  it('does not offer a pay change when nobody matches', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(url(API_PATH.raisePreview), () =>
        HttpResponse.json({ headcount: 0, payroll_before_usd: 0, payroll_after_usd: 0, sample: [] }),
      ),
    )
    renderWithProviders(<EmployeesPage />)

    await user.click(await screen.findByRole('button', { name: 'Adjust pay' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/^Change/), '5')

    expect(await within(dialog).findByText('No active employees match these filters.')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^Apply/ })).toBeDisabled()
  })
})
