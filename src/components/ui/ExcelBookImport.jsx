import { useRef, useState } from 'react'
import { Download, Upload, X } from 'lucide-react'
import { BOOK_FIELDS, importBookEntries } from '../../lib/entryBooks.js'
import { importDate, importNumber, loadExcelReader } from '../../lib/excelImport.js'

export default function ExcelBookImport({ user }) {
  const fileRef = useRef(null)
  const [workbook, setWorkbook] = useState(null), [name, setName] = useState(''), [sheet, setSheet] = useState(''), [headerRow, setHeaderRow] = useState(1), [mapping, setMapping] = useState({})
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('')
  const fields = [{ key: 'start', label: 'Start date' }, { key: 'end', label: 'End date' }, ...(user.departmentId === 'operations' ? [{ key: 'product', label: 'Product' }] : []), ...BOOK_FIELDS[user.departmentId]]
  const reader = window.XLSX
  const rows = workbook && reader ? reader.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, raw: true, defval: '' }) : []
  const headers = (rows[headerRow - 1] || []).map((value, index) => `${String(value || `Column ${index + 1}`)}`)
  const records = rows.slice(headerRow).filter(row => row.some(value => value !== ''))
  async function pick(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true); setError(''); setMessage('')
    try {
      if (!/\.xlsx$/i.test(file.name) || file.size > 10 * 1024 * 1024) throw new Error('Choose an .xlsx workbook smaller than 10 MB.')
      const xlsx = await loadExcelReader()
      const book = xlsx.read(await file.arrayBuffer(), { type: 'array', cellDates: true, sheetRows: 501 })
      if (!book.SheetNames.length) throw new Error('No worksheets found.')
      setWorkbook(book); setName(file.name); setSheet(book.SheetNames[0]); setHeaderRow(1); setMapping({})
    } catch (cause) { setError(cause.message) }
    finally { setBusy(false); event.target.value = '' }
  }
  function columnFor(field) { return mapping[field.key] ?? String(headers.findIndex(header => header.trim().toLowerCase() === field.label.toLowerCase())) }
  async function template() {
    try {
      const xlsx = await loadExcelReader(), book = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([fields.map(field => field.label)]), 'Entry book')
      xlsx.writeFile(book, `${user.departmentId}-entry-book.xlsx`)
    } catch (cause) { setError(cause.message) }
  }
  function importRows() {
    try {
      if (records.length > 200) throw new Error('Use a workbook containing at most 200 data rows per import.')
      if (fields.some(field => Number(columnFor(field)) < 0)) throw new Error('Choose a worksheet column for every required field.')
      const forms = records.map((row, index) => {
        try {
          const value = key => row[Number(columnFor(fields.find(field => field.key === key)))]
          const start = importDate(value('start'), reader), end = importDate(value('end'), reader)
          return { frequency: start === end ? 'daily' : 'weekly', start, end, product: user.departmentId === 'operations' ? String(value('product')).trim().toUpperCase() : '', values: Object.fromEntries(BOOK_FIELDS[user.departmentId].map(field => [field.key, importNumber(value(field.key))])), notes: `Imported from ${name} · ${sheet} · row ${headerRow + index + 1}` }
        } catch (cause) { throw new Error(`Row ${headerRow + index + 1}: ${cause.message}`) }
      })
      const imported = importBookEntries(user, forms)
      setMessage(`${imported.length} entries imported as drafts. Review each entry and submit it for approval.`); setError(''); setWorkbook(null)
    } catch (cause) { setError(cause.message) }
  }
  return <div className="space-y-3 border-b border-slate-200 pb-4">
    <div className="flex flex-wrap gap-2"><input ref={fileRef} type="file" accept=".xlsx" aria-label="Excel book file" onChange={pick} className="hidden" /><button type="button" disabled={busy} onClick={() => fileRef.current.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50"><Upload size={16} />{busy ? 'Reading workbook…' : 'Import Excel'}</button><button type="button" onClick={template} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-50"><Download size={16} />Entry book template</button></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-green-700">{message}</p>}
    {workbook && <div className="space-y-4 rounded-lg bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3"><div><h4 className="break-words text-sm font-semibold text-slate-900">{name}</h4><p className="mt-1 text-xs text-slate-500">Preview the worksheet and match its columns. Import saves drafts; it does not publish figures.</p></div><button type="button" aria-label="Close Excel preview" onClick={() => setWorkbook(null)}><X size={17} /></button></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-slate-700">Worksheet<select aria-label="Excel worksheet" value={sheet} onChange={event => { setSheet(event.target.value); setMapping({}) }} className="mt-1 min-h-10 w-full rounded border border-slate-300 bg-white px-2">{workbook.SheetNames.map(item => <option key={item}>{item}</option>)}</select></label><label className="text-sm text-slate-700">Header row<input aria-label="Excel header row" type="number" min={1} max={50} value={headerRow} onChange={event => { setHeaderRow(Math.max(1, Math.min(50, Number(event.target.value)))); setMapping({}) }} className="mt-1 min-h-10 w-full rounded border border-slate-300 bg-white px-2" /></label></div>
      <div className="max-w-full overflow-x-auto"><table className="dashboard-table"><thead><tr>{headers.map((header, index) => <th key={index}>{header}</th>)}</tr></thead><tbody>{records.slice(0, 5).map((row, index) => <tr key={index}>{headers.map((_, column) => <td key={column}>{row[column] instanceof Date ? row[column].toISOString().slice(0, 10) : String(row[column] ?? '')}</td>)}</tr>)}</tbody></table></div>
      <p className="text-xs text-slate-500">Showing the first five rows. {records.length} data rows detected{records.length >= 500 ? '; split large sheets before import' : ''}.</p>
      <div className="grid gap-3 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="text-xs font-medium text-slate-700">{field.label}<select aria-label={`Import column ${field.key}`} value={columnFor(field)} onChange={event => setMapping({ ...mapping, [field.key]: event.target.value })} className="mt-1 min-h-10 w-full rounded border border-slate-300 bg-white px-2 text-sm"><option value="-1">Choose column</option>{headers.map((header, index) => <option key={index} value={String(index)}>{header}</option>)}</select></label>)}</div>
      <p className="text-xs text-slate-500">Each row needs a date range within one month. Weekly rows cover at most seven days. Keep annual budget sheets as source documents and map dated figures into the entry book.</p>
      <button type="button" onClick={importRows} className="min-h-10 rounded-lg bg-[#B42318] px-4 text-sm font-semibold text-white">Import as drafts</button>
    </div>}
  </div>
}
