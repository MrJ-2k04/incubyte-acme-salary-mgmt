import { ROUTE } from '../routes'

export const TOUR_SEEN_KEY = 'acme-salary.tour-seen'

export const TOUR_TARGET = {
  nav: 'nav',
  stats: 'stats',
  countries: 'countries',
  table: 'employee-table',
  filters: 'filters',
  actions: 'employee-actions',
  account: 'account',
} as const

export type TourStep = {
  title: string
  body: string
  // Steps without a target show as a centred card.
  target?: (typeof TOUR_TARGET)[keyof typeof TOUR_TARGET]
  route?: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to ACME Salary Management',
    body: 'Take a 30 second tour of the essentials. You can replay it any time from the help button at the top.',
  },
  {
    target: TOUR_TARGET.nav,
    route: ROUTE.dashboard,
    title: 'Find your way',
    body: 'The dashboard shows how pay compares across the organisation. Employees holds every record.',
  },
  {
    target: TOUR_TARGET.stats,
    route: ROUTE.dashboard,
    title: 'Your organisation at a glance',
    body: 'Headcount, payroll and average pay, with every currency converted to USD.',
  },
  {
    target: TOUR_TARGET.countries,
    route: ROUTE.dashboard,
    title: 'Dig into the numbers',
    body: 'Select any country, bar or job title to open the people behind it.',
  },
  {
    target: TOUR_TARGET.table,
    route: ROUTE.employees,
    title: 'Every employee in one place',
    body: 'Pay shows in each person’s own currency. Sort by any column, edit anyone, and archive people who leave. Archived records are kept one tab away.',
  },
  {
    target: TOUR_TARGET.filters,
    route: ROUTE.employees,
    title: 'Find anyone fast',
    body: 'Search by name or email, then narrow by country, job title or department.',
  },
  {
    target: TOUR_TARGET.actions,
    route: ROUTE.employees,
    title: 'Change pay and move data',
    body: 'Adjust pay raises or cuts pay for everyone matching your filters, with a preview first. Import a CSV to add people in bulk, or export the list you are looking at.',
  },
  {
    target: TOUR_TARGET.account,
    title: 'Make it yours',
    body: 'Open the menu here to choose a light, dark or system theme, or to replay this tour. Enjoy!',
  },
]
