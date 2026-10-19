export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
