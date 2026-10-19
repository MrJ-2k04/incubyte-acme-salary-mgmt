import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import UnarchiveOutlined from '@mui/icons-material/UnarchiveOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { API_PATH, buildUrl } from '../api/client'
import { useEmployees, useImportEmployees, useReference, useSetArchived } from '../api/hooks'
import type { Employee, EmployeeQuery, SortOrder } from '../api/types'
import EmployeeDialog from '../components/EmployeeDialog'
import ImportResult from '../components/ImportResult'
import SelectField from '../components/SelectField'
import { formatMoney } from '../format'

const PAGE_SIZES = [25, 50, 100]

const COLUMNS: { field: keyof Employee; label: string; numeric?: boolean }[] = [
  { field: 'full_name', label: 'Name' },
  { field: 'email', label: 'Email' },
  { field: 'job_title', label: 'Job title' },
  { field: 'department', label: 'Department' },
  { field: 'country_code', label: 'Country' },
  { field: 'salary', label: 'Salary', numeric: true },
  { field: 'hired_on', label: 'Hired' },
]

type Filters = Pick<EmployeeQuery, 'q' | 'country' | 'job_title' | 'department' | 'include_archived'>

// Undefined means the dialog is closed, null means adding a new employee.
type Editing = Employee | null | undefined

export default function EmployeesPage() {
  const [filters, setFilters] = useState<Filters>({})
  const [sort, setSort] = useState<keyof Employee>('full_name')
  const [order, setOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZES[0])
  const [editing, setEditing] = useState<Editing>()

  const employees = useEmployees({ ...filters, sort, order, page: page + 1, size })
  const reference = useReference()
  const setArchived = useSetArchived()
  const importCsv = useImportEmployees()

  const filter = (field: keyof Filters) => (value: string | boolean) => {
    setFilters((current) => ({ ...current, [field]: value }))
    setPage(0)
  }

  function sortBy(field: keyof Employee) {
    setOrder(field === sort && order === 'asc' ? 'desc' : 'asc')
    setSort(field)
  }

  const options = (values: string[] = []) => values.map((value) => ({ value, label: value }))

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
        <TextField
          id="search"
          label="Search name or email"
          size="small"
          sx={{ minWidth: 240 }}
          value={filters.q ?? ''}
          onChange={(e) => filter('q')(e.target.value)}
        />
        <SelectField
          id="filter-country"
          label="Country"
          value={filters.country ?? ''}
          emptyLabel="All countries"
          options={(reference.data?.countries ?? []).map((c) => ({ value: c.code, label: c.name }))}
          onChange={filter('country')}
        />
        <SelectField
          id="filter-job-title"
          label="Job title"
          value={filters.job_title ?? ''}
          emptyLabel="All job titles"
          options={options(reference.data?.job_titles)}
          onChange={filter('job_title')}
        />
        <SelectField
          id="filter-department"
          label="Department"
          value={filters.department ?? ''}
          emptyLabel="All departments"
          options={options(reference.data?.departments)}
          onChange={filter('department')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(filters.include_archived)}
              onChange={(e) => filter('include_archived')(e.target.checked)}
            />
          }
          label="Show archived"
        />
        <Stack direction="row" spacing={1} sx={{ ml: { md: 'auto' } }}>
          <Button component="label" variant="outlined" loading={importCsv.isPending}>
            Import CSV
            <input
              hidden
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) importCsv.mutate(file)
                e.target.value = ''
              }}
            />
          </Button>
          <Button variant="outlined" href={buildUrl(API_PATH.export, { ...filters, sort, order })}>
            Export CSV
          </Button>
          <Button variant="contained" onClick={() => setEditing(null)}>
            Add employee
          </Button>
        </Stack>
      </Stack>

      {employees.error && <Alert severity="error">{employees.error.message}</Alert>}
      {importCsv.error && (
        <Alert severity="error" onClose={importCsv.reset}>
          {importCsv.error.message}
        </Alert>
      )}
      {importCsv.data && <ImportResult report={importCsv.data} onClose={importCsv.reset} />}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableCell key={column.field} align={column.numeric ? 'right' : 'left'}>
                    <TableSortLabel
                      active={sort === column.field}
                      direction={sort === column.field ? order : 'asc'}
                      onClick={() => sortBy(column.field)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.data?.items.map((employee) => (
                <TableRow key={employee.id} hover sx={{ opacity: employee.archived_at ? 0.5 : 1 }}>
                  <TableCell>{employee.full_name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.job_title}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.country_code}</TableCell>
                  <TableCell align="right">{formatMoney(employee.salary, employee.currency)}</TableCell>
                  <TableCell>{employee.hired_on}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      aria-label={`Edit ${employee.full_name}`}
                      onClick={() => setEditing(employee)}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`${employee.archived_at ? 'Restore' : 'Archive'} ${employee.full_name}`}
                      onClick={() => setArchived.mutate({ id: employee.id, archived: !employee.archived_at })}
                    >
                      {employee.archived_at ? (
                        <UnarchiveOutlined fontSize="small" />
                      ) : (
                        <ArchiveOutlined fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={employees.data?.total ?? 0}
          page={page}
          rowsPerPage={size}
          rowsPerPageOptions={PAGE_SIZES}
          onPageChange={(_, next) => setPage(next)}
          onRowsPerPageChange={(e) => {
            setSize(Number(e.target.value))
            setPage(0)
          }}
        />
      </Paper>

      {editing !== undefined && reference.data && (
        <EmployeeDialog
          employee={editing ?? undefined}
          reference={reference.data}
          onClose={() => setEditing(undefined)}
        />
      )}
    </Stack>
  )
}
