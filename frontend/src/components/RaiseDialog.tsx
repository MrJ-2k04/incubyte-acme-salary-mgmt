import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useId, useState } from 'react'
import { useApplyRaise, useRaisePreview } from '../api/hooks'
import type { SalaryAdjustment } from '../api/types'
import { formatCount, formatMoney } from '../format'
import type { EmployeeFilters } from '../routes'

// Mirrors the backend limits on a single pay change. Edit both together.
const MIN_PERCENT = -50
const MAX_PERCENT = 100
const REPORTING_CURRENCY = 'USD'

const FILTER_LABELS: Record<keyof EmployeeFilters, string> = {
  q: 'Search',
  country: 'Country',
  job_title: 'Job title',
  department: 'Department',
}

type Props = {
  filters: EmployeeFilters
  countryName: (code: string) => string | undefined
  onClose: () => void
  onApplied: (updated: number, percent: number) => void
}

export default function RaiseDialog({ filters, countryName, onClose, onApplied }: Props) {
  const titleId = useId()
  const [percentText, setPercentText] = useState('')
  const percent = Number(percentText)
  const valid = percentText !== '' && percent !== 0 && percent >= MIN_PERCENT && percent <= MAX_PERCENT
  const adjustment: SalaryAdjustment = { ...filters, percent }
  const preview = useRaisePreview(adjustment, valid)
  const apply = useApplyRaise()
  const headcount = valid ? preview.data?.headcount : undefined
  const scope = Object.entries(filters) as [keyof EmployeeFilters, string][]

  return (
    <Dialog open onClose={onClose} aria-labelledby={titleId} maxWidth="sm" fullWidth>
      <DialogTitle id={titleId}>Adjust pay</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Applies to every active employee matching the current filters. Archived people are never changed.
            </Typography>
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              {scope.length === 0 && <Chip size="small" label="Everyone" />}
              {scope.map(([key, value]) => (
                <Chip
                  key={key}
                  size="small"
                  label={`${FILTER_LABELS[key]}: ${key === 'country' ? (countryName(value) ?? value) : value}`}
                />
              ))}
            </Stack>
          </Stack>

          <TextField
            id="raise-percent"
            label="Change"
            type="number"
            size="small"
            autoFocus
            value={percentText}
            onChange={(e) => setPercentText(e.target.value)}
            helperText={`Use a minus sign for a cut. Between ${MIN_PERCENT}% and ${MAX_PERCENT}%.`}
            error={percentText !== '' && !valid}
            slotProps={{
              htmlInput: { min: MIN_PERCENT, max: MAX_PERCENT, step: 0.5 },
              input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
            }}
            sx={{ maxWidth: 220 }}
          />

          {apply.error && <Alert severity="error">{apply.error.message}</Alert>}
          {preview.error && <Alert severity="error">{preview.error.message}</Alert>}

          {valid && preview.data && headcount === 0 && (
            <Alert severity="info">No active employees match these filters.</Alert>
          )}

          {valid && preview.data && headcount !== undefined && headcount > 0 && (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={4}>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Affected
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>{`${formatCount(headcount)} active employees`}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Yearly payroll (USD)
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {`${formatMoney(preview.data.payroll_before_usd, REPORTING_CURRENCY)} → ${formatMoney(preview.data.payroll_after_usd, REPORTING_CURRENCY)}`}
                  </Typography>
                </div>
              </Stack>
              <Table size="small" aria-label="Example changes">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell align="right">Now</TableCell>
                    <TableCell align="right">After</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.data.sample.map((row) => (
                    <TableRow key={row.full_name}>
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell align="right">{formatMoney(row.salary, row.currency)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatMoney(row.new_salary, row.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!headcount}
          loading={apply.isPending}
          onClick={() => apply.mutate(adjustment, { onSuccess: ({ updated }) => onApplied(updated, percent) })}
        >
          {headcount ? `Apply to ${formatCount(headcount)} employees` : 'Apply'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
