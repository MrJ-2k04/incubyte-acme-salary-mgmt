import { http, HttpResponse } from 'msw'
import { API_PATH, API_URL } from '../api/client'
import type { Employee, EmployeePage, ReferenceData } from '../api/types'

export const url = (path: string) => new URL(path, API_URL).toString()

export const asha: Employee = {
  id: 1,
  full_name: 'Asha Rao',
  email: 'asha.rao@acmecorp.com',
  job_title: 'Software Engineer',
  department: 'Engineering',
  country_code: 'IN',
  currency: 'INR',
  salary: 2400000,
  hired_on: '2022-04-01',
  archived_at: null,
}

export const reference: ReferenceData = {
  countries: [
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'US', name: 'United States', currency: 'USD' },
  ],
  departments: ['Engineering', 'Finance'],
  job_titles: ['Accountant', 'Software Engineer'],
}

export function page(items: Employee[]): EmployeePage {
  return { items, total: items.length, page: 1, size: 25 }
}

export const referenceHandler = http.get(url(API_PATH.reference), () => HttpResponse.json(reference))
