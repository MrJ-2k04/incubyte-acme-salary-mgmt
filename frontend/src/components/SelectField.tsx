import TextField, { type TextFieldProps } from '@mui/material/TextField'

type Option = { value: string; label: string }

type Props = Omit<TextFieldProps, 'select' | 'onChange'> & {
  id: string
  options: Option[]
  emptyLabel?: string
  onChange: (value: string) => void
}

// Native select keeps the field accessible and simple to drive in tests.
export default function SelectField({ options, emptyLabel, onChange, ...props }: Props) {
  return (
    <TextField
      select
      size="small"
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      {...props}
    >
      {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </TextField>
  )
}
