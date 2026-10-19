import AddRounded from '@mui/icons-material/AddRounded'
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import EditOutlined from '@mui/icons-material/EditOutlined'
import PersonSearchOutlined from '@mui/icons-material/PersonSearchOutlined'
import SearchRounded from '@mui/icons-material/SearchRounded'
import UnarchiveOutlined from '@mui/icons-material/UnarchiveOutlined'
import UploadRounded from '@mui/icons-material/UploadRounded'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_PATH, buildUrl } from '../api/client'
import { useEmployees, useImportEmployees, useReference, useSetArchived } from '../api/hooks'
import { EMPLOYEE_STATUS, type Employee, type SortOrder } from '../api/types'
import EmployeeDialog from '../components/EmployeeDialog'
import ImportResult from '../components/ImportResult'
import PageHeader from '../components/PageHeader'
import SelectField from '../components/SelectField'
import Surface from '../components/Surface'
import { formatCount, formatDate, formatMoney } from '../format'
import { EMPLOYEE_FILTERS, type EmployeeFilters } from '../routes'
import { accentFor, softTone } from '../theme/tone'

const PAGE_SIZES = [25, 50, 100]
const SKELETON_ROWS = 8

const COLUMNS: { field: keyof Employee; label: string; numeric?: boolean }[] = [
  { field: 'full_name', label: 'Employee' },
  { field: 'job_title', label: 'Job title' },
  { field: 'department', label: 'Department' },
  { field: 'country_code', label: 'Country' },
  { field: 'salary', label: 'Salary', numeric: true },
  { field: 'hired_on', label: 'Hired' },
]

const COLUMN_COUNT = COLUMNS.length + 1

const visuallyHidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } as const

// Undefined means the dialog is closed, null means adding a new employee.
type Editing = Employee | null | undefined

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function EmployeesPage() {
  const [params, setParams] = useSearchParams()
  const [includeArchived, setIncludeArchived] = useState(false)
  const [sort, setSort] = useState<keyof Employee>('full_name')
  const [order, setOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(PAGE_SIZES[0])
  const [editing, setEditing] = useState<Editing>()

  // Filters live in the address so the dashboard and shared links can open a filtered list.
  const filters: EmployeeFilters = Object.fromEntries(
    EMPLOYEE_FILTERS.flatMap((key) => (params.get(key) ? [[key, params.get(key)]] : [])),
  )
  const query = { ...filters, status: includeArchived ? EMPLOYEE_STATUS.all : EMPLOYEE_STATUS.active }
  const employees = useEmployees({ ...query, sort, order, page: page + 1, size })
  const reference = useReference()
  const setArchived = useSetArchived()
  const importCsv = useImportEmployees()

  const countryName = new Map(reference.data?.countries.map((c) => [c.code, c.name]))

  const filter = (key: keyof EmployeeFilters) => (value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
    setPage(0)
  }

  function sortBy(field: keyof Employee) {
    setOrder(field === sort && order === 'asc' ? 'desc' : 'asc')
    setSort(field)
  }

  const options = (values: string[] = []) => values.map((value) => ({ value, label: value }))
  const total = employees.data?.total

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Employees"
        subtitle={total === undefined ? 'Loading people…' : `${formatCount(total)} people across the organisation`}
        actions={
          <>
            <Button
              component="label"
              variant="outlined"
              color="inherit"
              startIcon={<UploadRounded />}
              loading={importCsv.isPending}
              sx={{ borderColor: 'divider' }}
            >
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
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadRounded />}
              href={buildUrl(API_PATH.export, { ...query, sort, order })}
              sx={{ borderColor: 'divider' }}
            >
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setEditing(null)}>
              Add employee
            </Button>
          </>
        }
      />

      {employees.error && <Alert severity="error">{employees.error.message}</Alert>}
      {importCsv.error && (
        <Alert severity="error" onClose={importCsv.reset}>
          {importCsv.error.message}
        </Alert>
      )}
      {importCsv.data && <ImportResult report={importCsv.data} onClose={importCsv.reset} />}

      <Surface>
        {employees.isFetching && (
          <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 3 }} />
        )}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ p: 2, alignItems: { md: 'center' }, borderBottom: 1, borderColor: 'divider' }}
        >
          <TextField
            id="search"
            placeholder="Search name or email"
            size="small"
            sx={{ minWidth: { md: 280 } }}
            value={filters.q ?? ''}
            onChange={(e) => filter('q')(e.target.value)}
            slotProps={{
              htmlInput: { 'aria-label': 'Search name or email' },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
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
            sx={{ ml: { md: 'auto' }, mr: 0, '& .MuiFormControlLabel-label': { fontSize: 14 } }}
            control={
              <Switch
                size="small"
                checked={includeArchived}
                onChange={(e) => {
                  setIncludeArchived(e.target.checked)
                  setPage(0)
                }}
              />
            }
            label="Show archived"
          />
        </Stack>

        <TableContainer sx={{ maxHeight: { md: 'calc(100vh - 360px)' }, minHeight: 240 }}>
          <Table stickyHeader>
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
                <TableCell align="right">
                  <Box component="span" sx={visuallyHidden}>
                    Actions
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!employees.data &&
                Array.from({ length: SKELETON_ROWS }, (_, row) => (
                  <TableRow key={row}>
                    {Array.from({ length: COLUMN_COUNT }, (_, cell) => (
                      <TableCell key={cell}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {employees.data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} sx={{ py: 8, textAlign: 'center', border: 0 }}>
                    <PersonSearchOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography sx={{ fontWeight: 600, mt: 1 }}>No employees found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try a different search or clear the filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {employees.data?.items.map((employee) => {
                const archived = Boolean(employee.archived_at)
                return (
                  <TableRow
                    key={employee.id}
                    hover
                    sx={{
                      '& .row-actions': { opacity: { md: 0 }, transition: 'opacity 120ms' },
                      '&:hover .row-actions, &:focus-within .row-actions': { opacity: 1 },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', opacity: archived ? 0.55 : 1 }}>
                        <Avatar
                          sx={[
                            { width: 34, height: 34, fontSize: 13, fontWeight: 600 },
                            softTone(accentFor(employee.id)),
                          ]}
                        >
                          {initials(employee.full_name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {employee.full_name}
                            </Typography>
                            {archived && <Chip label="Archived" size="small" sx={{ height: 20, fontSize: 11 }} />}
                          </Stack>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {employee.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ opacity: archived ? 0.55 : 1, whiteSpace: 'nowrap' }}>{employee.job_title}</TableCell>
                    <TableCell sx={{ opacity: archived ? 0.55 : 1 }}>
                      <Chip
                        label={employee.department}
                        size="small"
                        sx={[{ height: 24, fontSize: 12 }, softTone(accentFor(employee.department))]}
                      />
                    </TableCell>
                    <TableCell sx={{ opacity: archived ? 0.55 : 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Chip
                          label={employee.country_code}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: 11, fontWeight: 600, borderColor: 'divider' }}
                        />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {countryName.get(employee.country_code)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', opacity: archived ? 0.55 : 1 }}
                    >
                      {formatMoney(employee.salary, employee.currency)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap', opacity: archived ? 0.55 : 1 }}>
                      {formatDate(employee.hired_on)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Stack direction="row" spacing={0.5} className="row-actions" sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            aria-label={`Edit ${employee.full_name}`}
                            onClick={() => setEditing(employee)}
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={archived ? 'Restore' : 'Archive'}>
                          <IconButton
                            size="small"
                            aria-label={`${archived ? 'Restore' : 'Archive'} ${employee.full_name}`}
                            onClick={() => setArchived.mutate({ id: employee.id, archived: !archived })}
                          >
                            {archived ? <UnarchiveOutlined fontSize="small" /> : <ArchiveOutlined fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {total
              ? `Showing ${formatCount(page * size + 1)}–${formatCount(Math.min((page + 1) * size, total))} of ${formatCount(total)}`
              : 'No results'}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ ml: { sm: 'auto' }, alignItems: 'center' }}>
            <SelectField
              id="page-size"
              label="Rows"
              value={String(size)}
              options={PAGE_SIZES.map((option) => ({ value: String(option), label: String(option) }))}
              onChange={(value) => {
                setSize(Number(value))
                setPage(0)
              }}
              sx={{ width: 80 }}
            />
            <Pagination
              count={Math.max(1, Math.ceil((total ?? 0) / size))}
              page={page + 1}
              onChange={(_, next) => setPage(next - 1)}
              shape="rounded"
              color="primary"
              size="small"
              siblingCount={1}
            />
          </Stack>
        </Stack>
      </Surface>

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
