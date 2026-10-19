import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_PATH, request } from './client'
import type {
  CountryInsight,
  Distribution,
  Employee,
  EmployeeInput,
  EmployeePage,
  EmployeeQuery,
  ImportReport,
  JobTitleInsight,
  RaisePreview,
  ReferenceData,
  SalaryAdjustment,
  Summary,
} from './types'

const KEY = {
  employees: 'employees',
  reference: 'reference',
  insights: 'insights',
} as const

export function useEmployees(query: EmployeeQuery) {
  return useQuery({
    queryKey: [KEY.employees, query],
    queryFn: () => request<EmployeePage>(API_PATH.employees, { params: query }),
    placeholderData: keepPreviousData,
  })
}

export function useReference() {
  return useQuery({
    queryKey: [KEY.reference],
    queryFn: () => request<ReferenceData>(API_PATH.reference),
  })
}

// Any change to employees can move every list, total and insight, so all of them refresh.
function useInvalidateAll() {
  const client = useQueryClient()
  return () => client.invalidateQueries()
}

export function useSaveEmployee() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: Partial<EmployeeInput> }) =>
      request<Employee>(id ? API_PATH.employee(id) : API_PATH.employees, {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: invalidate,
  })
}

export function useSetArchived() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) =>
      request<Employee>(archived ? API_PATH.archive(id) : API_PATH.restore(id), { method: 'POST' }),
    onSuccess: invalidate,
  })
}

export function useImportEmployees() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData()
      body.append('file', file)
      return request<ImportReport>(API_PATH.import, { method: 'POST', body })
    },
    onSuccess: invalidate,
  })
}

// Previews are reads, so they are cached per percent and filter like any other query.
export function useRaisePreview(adjustment: SalaryAdjustment, enabled: boolean) {
  return useQuery({
    queryKey: [KEY.employees, 'raise-preview', adjustment],
    queryFn: () =>
      request<RaisePreview>(API_PATH.raisePreview, { method: 'POST', body: JSON.stringify(adjustment) }),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useApplyRaise() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (adjustment: SalaryAdjustment) =>
      request<{ updated: number }>(API_PATH.raise, { method: 'POST', body: JSON.stringify(adjustment) }),
    onSuccess: invalidate,
  })
}

export function useSummary() {
  return useQuery({
    queryKey: [KEY.insights, 'summary'],
    queryFn: () => request<Summary>(API_PATH.insightsSummary),
  })
}

export function useCountryInsights() {
  return useQuery({
    queryKey: [KEY.insights, 'countries'],
    queryFn: () => request<CountryInsight[]>(API_PATH.insightsCountries),
  })
}

export function useJobTitleInsights(countryCode: string) {
  return useQuery({
    queryKey: [KEY.insights, 'job-titles', countryCode],
    queryFn: () => request<JobTitleInsight[]>(API_PATH.insightsJobTitles(countryCode)),
    enabled: Boolean(countryCode),
  })
}

export function useDistribution(countryCode: string) {
  return useQuery({
    queryKey: [KEY.insights, 'distribution', countryCode],
    queryFn: () =>
      request<Distribution>(API_PATH.insightsDistribution, { params: { country: countryCode } }),
  })
}
