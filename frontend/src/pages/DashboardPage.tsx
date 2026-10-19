import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import PublicOutlined from '@mui/icons-material/PublicOutlined'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { type ReactNode, useState } from 'react'
import { useCountryInsights, useDistribution, useJobTitleInsights, useSummary } from '../api/hooks'
import PageHeader from '../components/PageHeader'
import SelectField from '../components/SelectField'
import Surface from '../components/Surface'
import { formatCompactMoney, formatCount, formatMoney } from '../format'

const REPORTING_CURRENCY = 'USD'
const CHART_HEIGHT = 300
const CHART_COLOR = 'var(--mui-palette-primary-main)'
const NUMERIC = { fontVariantNumeric: 'tabular-nums' } as const

function Stat({ label, value, icon }: { label: string; value?: string; icon: ReactNode }) {
  return (
    <Surface sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.1)',
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography variant="h5" sx={NUMERIC}>
        {value ?? <Skeleton width="60%" />}
      </Typography>
    </Surface>
  )
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Surface>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ p: 2.5, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}
      >
        <div>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </div>
        {action}
      </Stack>
      {children}
    </Surface>
  )
}

// A thin bar shows each value against the largest one in the table.
function Meter({ value, max }: { value: number; max: number }) {
  return (
    <LinearProgress
      variant="determinate"
      value={max ? (value / max) * 100 : 0}
      sx={{ width: 64, height: 6, borderRadius: 3, display: { xs: 'none', sm: 'block' } }}
    />
  )
}

export default function DashboardPage() {
  const summary = useSummary()
  const countries = useCountryInsights()
  const [titleCountry, setTitleCountry] = useState('')
  const [distributionCountry, setDistributionCountry] = useState('')
  const jobTitles = useJobTitleInsights(titleCountry)
  const distribution = useDistribution(distributionCountry)

  const countryOptions = (countries.data ?? []).map((c) => ({ value: c.country_code, label: c.country_name }))
  const titleCurrency = countries.data?.find((c) => c.country_code === titleCountry)?.currency
  const maxCountryAvg = Math.max(0, ...(countries.data ?? []).map((c) => c.avg_salary_usd))
  const maxTitleAvg = Math.max(0, ...(jobTitles.data ?? []).map((t) => t.avg_salary))
  const error = summary.error ?? countries.error

  return (
    <Stack spacing={3}>
      <PageHeader title="Dashboard" subtitle="How pay compares across countries, roles and ranges." />

      {error && <Alert severity="error">{error.message}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat
            label="Active employees"
            icon={<GroupsOutlined fontSize="small" />}
            value={summary.data && formatCount(summary.data.headcount)}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat
            label="Countries"
            icon={<PublicOutlined fontSize="small" />}
            value={summary.data && formatCount(summary.data.countries)}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat
            label="Total payroll (USD)"
            icon={<AccountBalanceWalletOutlined fontSize="small" />}
            value={summary.data && formatMoney(summary.data.total_payroll_usd, REPORTING_CURRENCY)}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat
            label="Average salary (USD)"
            icon={<TrendingUpRounded fontSize="small" />}
            value={summary.data && formatMoney(summary.data.avg_salary_usd, REPORTING_CURRENCY)}
          />
        </Grid>
      </Grid>

      <Section title="Pay by country" description="Average salary converted to USD, with local ranges below.">
        {countries.data && countries.data.length > 0 && (
          <Box sx={{ px: 1 }}>
            <BarChart
              height={CHART_HEIGHT}
              dataset={countries.data}
              borderRadius={6}
              hideLegend
              grid={{ horizontal: true }}
              xAxis={[{ scaleType: 'band', dataKey: 'country_code', categoryGapRatio: 0.45, disableLine: true, disableTicks: true }]}
              yAxis={[
                {
                  disableLine: true,
                  disableTicks: true,
                  valueFormatter: (v: number) => formatCompactMoney(v, REPORTING_CURRENCY),
                },
              ]}
              series={[
                {
                  dataKey: 'avg_salary_usd',
                  label: 'Average salary (USD)',
                  color: CHART_COLOR,
                  valueFormatter: (v) => formatMoney(v ?? 0, REPORTING_CURRENCY),
                },
              ]}
            />
          </Box>
        )}
        <TableContainer sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Country</TableCell>
                <TableCell align="right">Headcount</TableCell>
                <TableCell align="right">Minimum</TableCell>
                <TableCell align="right">Average</TableCell>
                <TableCell align="right">Maximum</TableCell>
                <TableCell align="right">Average (USD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {countries.data?.map((c) => (
                <TableRow key={c.country_code} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{c.country_name}</TableCell>
                  <TableCell align="right" sx={NUMERIC}>
                    {formatCount(c.headcount)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...NUMERIC, color: 'text.secondary' }}>
                    {formatMoney(c.min_salary, c.currency)}
                  </TableCell>
                  <TableCell align="right" sx={NUMERIC}>
                    {formatMoney(c.avg_salary, c.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...NUMERIC, color: 'text.secondary' }}>
                    {formatMoney(c.max_salary, c.currency)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Meter value={c.avg_salary_usd} max={maxCountryAvg} />
                      <Box component="span" sx={{ ...NUMERIC, fontWeight: 600, minWidth: 80 }}>
                        {formatMoney(c.avg_salary_usd, REPORTING_CURRENCY)}
                      </Box>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Section
            title="Pay by job title"
            description="Compare roles within one country."
            action={
              <SelectField
                id="job-title-country"
                label="Country for job titles"
                value={titleCountry}
                emptyLabel="Choose a country"
                options={countryOptions}
                onChange={setTitleCountry}
                sx={{ minWidth: 200 }}
              />
            }
          >
            {!titleCountry && (
              <Box sx={{ px: 2.5, pb: 6, pt: 4, textAlign: 'center' }}>
                <PublicOutlined sx={{ fontSize: 36, color: 'text.disabled' }} />
                <Typography color="text.secondary">Choose a country to compare its roles.</Typography>
              </Box>
            )}
            {titleCurrency && (
              <TableContainer sx={{ borderTop: 1, borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job title</TableCell>
                      <TableCell align="right">Headcount</TableCell>
                      <TableCell align="right">Range</TableCell>
                      <TableCell align="right">Average</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobTitles.data?.map((t) => (
                      <TableRow key={t.job_title} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{t.job_title}</TableCell>
                        <TableCell align="right" sx={NUMERIC}>
                          {formatCount(t.headcount)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...NUMERIC, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                          {formatCompactMoney(t.min_salary, titleCurrency)} –{' '}
                          {formatCompactMoney(t.max_salary, titleCurrency)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
                          >
                            <Meter value={t.avg_salary} max={maxTitleAvg} />
                            <Box component="span" sx={{ ...NUMERIC, fontWeight: 600 }}>
                              {formatMoney(t.avg_salary, titleCurrency)}
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Section>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Section
            title="Salary distribution"
            description="How many people earn within each band."
            action={
              <SelectField
                id="distribution-country"
                label="Distribution scope"
                value={distributionCountry}
                emptyLabel="Whole org (USD)"
                options={countryOptions}
                onChange={setDistributionCountry}
                sx={{ minWidth: 200 }}
              />
            }
          >
            {distribution.data && (
              <Box sx={{ px: 1 }}>
                <BarChart
                  height={CHART_HEIGHT}
                  borderRadius={4}
                  hideLegend
                  grid={{ horizontal: true }}
                  dataset={distribution.data.buckets.map((b) => ({
                    range: `${formatCompactMoney(b.lower, distribution.data.currency)}–${formatCompactMoney(b.upper, distribution.data.currency)}`,
                    count: b.count,
                  }))}
                  xAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'range',
                      categoryGapRatio: 0.15,
                      disableLine: true,
                      disableTicks: true,
                      tickLabelStyle: { fontSize: 10 },
                    },
                  ]}
                  yAxis={[{ disableLine: true, disableTicks: true }]}
                  series={[{ dataKey: 'count', label: 'Employees', color: CHART_COLOR }]}
                />
              </Box>
            )}
          </Section>
        </Grid>
      </Grid>
    </Stack>
  )
}
