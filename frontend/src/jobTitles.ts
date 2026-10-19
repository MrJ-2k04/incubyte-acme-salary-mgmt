import type { ReferenceData } from './api/types'

// Without a department, every title in use is offered.
export function jobTitlesFor(reference: ReferenceData | undefined, department?: string): string[] {
  if (!reference) return []
  if (department) return reference.job_titles[department] ?? []
  return [...new Set(Object.values(reference.job_titles).flat())].sort()
}
