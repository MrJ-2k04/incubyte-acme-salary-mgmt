import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { type FormEvent, useState } from 'react'
import { useSaveEmployee } from '../api/hooks'
import type { Employee, EmployeeInput, ReferenceData } from '../api/types'
import { jobTitlesFor } from '../jobTitles'
import SelectField from './SelectField'

type Props = {
  employee?: Employee
  reference: ReferenceData
  onClose: () => void
}

type Form = Record<keyof EmployeeInput, string>

const EMPTY_FORM: Form = {
  full_name: '',
  email: '',
  job_title: '',
  department: '',
  country_code: '',
  salary: '',
  hired_on: '',
}

function toForm(employee?: Employee): Form {
  if (!employee) return EMPTY_FORM
  return { ...employee, salary: String(employee.salary) }
}

export default function EmployeeDialog({ employee, reference, onClose }: Props) {
  const [form, setForm] = useState<Form>(() => toForm(employee))
  const save = useSaveEmployee()
  const set = (field: keyof Form) => (value: string) => setForm((current) => ({ ...current, [field]: value }))
  const options = (values: string[]) => values.map((value) => ({ value, label: value }))

  function submit(event: FormEvent) {
    event.preventDefault()
    const data: EmployeeInput = {
      full_name: form.full_name,
      email: form.email,
      job_title: form.job_title,
      department: form.department,
      country_code: form.country_code,
      salary: Number(form.salary),
      hired_on: form.hired_on,
    }
    save.mutate({ id: employee?.id, data }, { onSuccess: onClose })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit}>
        <DialogTitle sx={{ pb: 0.5 }}>{employee ? 'Edit employee' : 'Add employee'}</DialogTitle>
        <Typography variant="body2" color="text.secondary" sx={{ px: 3 }}>
          {employee ? `Update details for ${employee.full_name}.` : 'Add a new person to the payroll.'}
        </Typography>
        <DialogContent>
          {save.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {save.error.message}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gap: 2, pt: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              id="full-name"
              label="Full name"
              size="small"
              sx={{ gridColumn: '1 / -1' }}
              required
              value={form.full_name}
              onChange={(e) => set('full_name')(e.target.value)}
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              size="small"
              sx={{ gridColumn: '1 / -1' }}
              required
              value={form.email}
              onChange={(e) => set('email')(e.target.value)}
            />
            <SelectField
              id="job-title"
              label="Job title"
              required
              value={form.job_title}
              emptyLabel=""
              options={options(jobTitlesFor(reference))}
              onChange={set('job_title')}
            />
            <SelectField
              id="department"
              label="Department"
              required
              value={form.department}
              emptyLabel=""
              options={options(reference.departments)}
              onChange={set('department')}
            />
            <SelectField
              id="country"
              label="Country"
              required
              sx={{ gridColumn: '1 / -1' }}
              value={form.country_code}
              emptyLabel=""
              options={reference.countries.map((c) => ({ value: c.code, label: `${c.name} (${c.currency})` }))}
              onChange={set('country_code')}
            />
            <TextField
              id="salary"
              label="Annual salary"
              type="number"
              size="small"
              required
              helperText="In the country's currency"
              value={form.salary}
              onChange={(e) => set('salary')(e.target.value)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <TextField
              id="hired-on"
              label="Hire date"
              type="date"
              size="small"
              required
              value={form.hired_on}
              onChange={(e) => set('hired_on')(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={save.isPending}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
