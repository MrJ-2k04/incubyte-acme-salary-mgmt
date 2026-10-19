export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Mirrors the backend router prefixes. Edit both together.
export const API_PATH = {
  employees: '/api/employees',
  employee: (id: number) => `/api/employees/${id}`,
  archive: (id: number) => `/api/employees/${id}/archive`,
  restore: (id: number) => `/api/employees/${id}/restore`,
  reference: '/api/reference',
  insightsCountries: '/api/insights/countries',
  insightsJobTitles: (code: string) => `/api/insights/countries/${code}/job-titles`,
  insightsSummary: '/api/insights/summary',
  insightsDistribution: '/api/insights/distribution',
} as const

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

type Params = Record<string, string | number | boolean | undefined>

export function buildUrl(path: string, params: Params = {}): string {
  const url = new URL(path, API_URL)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }
  return url.toString()
}

export async function request<T>(path: string, init: RequestInit & { params?: Params } = {}): Promise<T> {
  const { params, ...rest } = init
  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...rest.headers },
  })
  const body = await response.json()
  if (!response.ok) throw new ApiError(response.status, errorMessage(body.detail))
  return body as T
}

// FastAPI sends a string for domain errors and a list for validation errors.
function errorMessage(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(', ')
  return 'Something went wrong'
}
