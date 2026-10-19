export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function formatCompactMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(amount)
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// Dates arrive as plain calendar days, so format them in UTC to avoid shifting a day.
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(isoDate))
}
