import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
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
import SelectField from '../components/SelectField'
import { formatCount, formatMoney } from '../format'

const REPORTING_CURRENCY = 'USD'
const CHART_HEIGHT = 280

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5">{value ?? '…'}</Typography>
      </CardContent>
    </Card>
  )
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  )
}

export default function InsightsPage() {
  const summary = useSummary()
  const countries = useCountryInsights()
  const [titleCountry, setTitleCountry] = useState('')
  const [distributionCountry, setDistributionCountry] = useState('')
  const jobTitles = useJobTitleInsights(titleCountry)
  const distribution = useDistribution(distributionCountry)

  const countryOptions = (countries.data ?? []).map((c) => ({ value: c.country_code, label: c.country_name }))
  const titleCurrency = countries.data?.find((c) => c.country_code === titleCountry)?.currency
  const error = summary.error ?? countries.error

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error.message}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat label="Active employees" value={summary.data && formatCount(summary.data.headcount)} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat label="Countries" value={summary.data && formatCount(summary.data.countries)} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat
            label="Total payroll (USD)"
            value={summary.data && formatMoney(summary.data.total_payroll_usd, REPORTING_CURRENCY)}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat
            label="Average salary (USD)"
            value={summary.data && formatMoney(summary.data.avg_salary_usd, REPORTING_CURRENCY)}
          />
        </Grid>
      </Grid>

      <Section title="Pay by country">
        {countries.data && countries.data.length > 0 && (
          <BarChart
            height={CHART_HEIGHT}
            dataset={countries.data}
            xAxis={[{ scaleType: 'band', dataKey: 'country_code' }]}
            series={[
              {
                dataKey: 'avg_salary_usd',
                label: 'Average salary (USD)',
                valueFormatter: (v) => formatMoney(v ?? 0, REPORTING_CURRENCY),
              },
            ]}
          />
        )}
        <TableContainer>
          <Table size="small">
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
                <TableRow key={c.country_code}>
                  <TableCell>{c.country_name}</TableCell>
                  <TableCell align="right">{formatCount(c.headcount)}</TableCell>
                  <TableCell align="right">{formatMoney(c.min_salary, c.currency)}</TableCell>
                  <TableCell align="right">{formatMoney(c.avg_salary, c.currency)}</TableCell>
                  <TableCell align="right">{formatMoney(c.max_salary, c.currency)}</TableCell>
                  <TableCell align="right">{formatMoney(c.avg_salary_usd, REPORTING_CURRENCY)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section
        title="Pay by job title"
        action={
          <SelectField
            id="job-title-country"
            label="Country for job titles"
            value={titleCountry}
            emptyLabel="Choose a country"
            options={countryOptions}
            onChange={setTitleCountry}
          />
        }
      >
        {!titleCountry && <Typography color="text.secondary">Choose a country to compare its roles.</Typography>}
        {titleCurrency && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job title</TableCell>
                  <TableCell align="right">Headcount</TableCell>
                  <TableCell align="right">Minimum</TableCell>
                  <TableCell align="right">Average</TableCell>
                  <TableCell align="right">Maximum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobTitles.data?.map((t) => (
                  <TableRow key={t.job_title}>
                    <TableCell>{t.job_title}</TableCell>
                    <TableCell align="right">{formatCount(t.headcount)}</TableCell>
                    <TableCell align="right">{formatMoney(t.min_salary, titleCurrency)}</TableCell>
                    <TableCell align="right">{formatMoney(t.avg_salary, titleCurrency)}</TableCell>
                    <TableCell align="right">{formatMoney(t.max_salary, titleCurrency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Section>

      <Section
        title="Salary distribution"
        action={
          <SelectField
            id="distribution-country"
            label="Distribution scope"
            value={distributionCountry}
            emptyLabel="Whole org (USD)"
            options={countryOptions}
            onChange={setDistributionCountry}
          />
        }
      >
        {distribution.data && (
          <BarChart
            height={CHART_HEIGHT}
            dataset={distribution.data.buckets.map((b) => ({
              range: `${formatMoney(b.lower, distribution.data.currency)} – ${formatMoney(b.upper, distribution.data.currency)}`,
              count: b.count,
            }))}
            xAxis={[{ scaleType: 'band', dataKey: 'range', tickLabelStyle: { fontSize: 10 } }]}
            series={[{ dataKey: 'count', label: 'Employees' }]}
          />
        )}
      </Section>
    </Stack>
  )
}
