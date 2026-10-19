import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { ImportReport } from '../api/types'

const SHOWN_REJECTIONS = 20

type Props = { report: ImportReport; onClose: () => void }

export default function ImportResult({ report, onClose }: Props) {
  const { imported, rejected } = report
  const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`
  const summary = `Imported ${plural(imported, 'employee')}.${rejected.length ? ` ${plural(rejected.length, 'line')} rejected.` : ''}`

  return (
    <Alert severity={rejected.length ? 'warning' : 'success'} onClose={onClose}>
      <AlertTitle>{summary}</AlertTitle>
      {rejected.slice(0, SHOWN_REJECTIONS).map((row) => (
        <div key={row.line}>{`Line ${row.line}: ${row.errors.join(', ')}`}</div>
      ))}
      {rejected.length > SHOWN_REJECTIONS && <div>{`And ${rejected.length - SHOWN_REJECTIONS} more.`}</div>}
    </Alert>
  )
}
