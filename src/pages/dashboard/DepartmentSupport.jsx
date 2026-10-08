import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { InlineMessage } from '../../components/ui/InlineMessage.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { departments } from '../../data/scorecardData.js'
import { TASK_STATUSES, TASK_PRIORITIES, subscribeToTasks, listTasks, addTask, setTaskStatus } from '../../lib/departmentTasks.js'

const PRIORITY_TONE = { Low: 'neutral', Medium: 'caution', High: 'warning', Critical: 'negative' }
const STATUS_TONE = { 'To do': 'neutral', 'In progress': 'caution', Blocked: 'negative', Done: 'positive' }

// Support for HOD/staff: the tasks of their own department only.
export default function DepartmentSupport() {
  const { user } = useAuth()
  const department = departments.find((d) => d.id === user.departmentId)
  const [version, setVersion] = useState(0)
  useEffect(() => subscribeToTasks(() => setVersion((v) => v + 1)), [])
  const tasks = useMemo(() => listTasks(user), [user, version]) // eslint-disable-line react-hooks/exhaustive-deps
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', due: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const act = (fn) => { try { fn(); setError(''); return true } catch (e) { setError(e.message); return false } }
  const counts = TASK_STATUSES.map((s) => [s, tasks.filter((t) => t.status === s).length])

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Activities · {department?.name}</h2>
          <p className="text-sm text-slate-500">Company-related tasks and work your department is doing.</p>
        </div>
        <button type="button" onClick={() => setAdding((a) => !a)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#B42318] px-4 text-sm font-semibold text-white"><Plus size={16} />New task</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {counts.map(([s, n]) => <Card key={s}><CardContent className="pt-4"><div className="text-2xl font-black tabular-nums text-slate-900">{n}</div><div className="text-xs text-slate-500">{s}</div></CardContent></Card>)}
      </div>

      {adding && (
        <Card><CardContent className="pt-5">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (act(() => addTask(user, form))) { setForm({ title: '', description: '', priority: 'Medium', due: '' }); setAdding(false) } }}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" maxLength={160} className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm md:col-span-2" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details (optional)" rows={2} className="rounded-lg border border-slate-200 p-3 text-sm md:col-span-2" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm">{TASK_PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
            <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm" />
            <button type="submit" className="min-h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white md:col-span-2">Add task</button>
          </form>
        </CardContent></Card>
      )}
      <InlineMessage tone="negative">{error}</InlineMessage>

      <div className="space-y-3">
        {tasks.map((t) => (
          <Card key={t.id}><CardContent className="pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="font-medium text-slate-900">{t.title}</div>
                {t.description && <p className="mt-0.5 text-sm text-slate-500">{t.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <StatusBadge tone={PRIORITY_TONE[t.priority]} label={t.priority} />
                  <span>Due {new Date(t.due).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <StatusBadge tone={STATUS_TONE[t.status]} label={t.status} />
                <select value={t.status} onChange={(e) => act(() => setTaskStatus(user, t.id, e.target.value))} aria-label={`Status for ${t.title}`} className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700">
                  {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </CardContent></Card>
        ))}
      </div>
      <p className="text-center text-xs text-slate-400">Development preview: tasks are stored in this browser only.</p>
    </div>
  )
}
