// Department task tracker (the HOD/staff view of "Support").
//
// Tracks company-related tasks for ONE department. The department is always
// resolved from the authenticated user — callers cannot pass another
// department. localStorage-backed in this sanitized copy; swap the bodies for
// API calls later and enforce the same scoping server-side.

import { hasPermission } from '../auth/permissions.js'

const STORE_KEY = 'vpms-department-tasks'
const CHANGE_EVENT = 'vpms:tasks-changed'

export const TASK_STATUSES = ['To do', 'In progress', 'Blocked', 'Done']
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const DAY = 86400000

function seedFor(departmentId) {
  const now = Date.now()
  return [
    { id: `${departmentId}-t1`, title: 'Submit monthly KPI figures', description: 'Enter this month\'s KPI actuals for GM approval. (Sample task)', priority: 'High', status: 'In progress', due: now + 3 * DAY, createdBy: 'system', createdAt: now - 5 * DAY },
    { id: `${departmentId}-t2`, title: 'Review open staff forum concerns for this department', description: 'Check the Forum for items that need a department response. (Sample task)', priority: 'Medium', status: 'To do', due: now + 7 * DAY, createdBy: 'system', createdAt: now - 2 * DAY },
    { id: `${departmentId}-t3`, title: 'Update department risk register', description: '(Sample task)', priority: 'Low', status: 'Done', due: now - 2 * DAY, createdBy: 'system', createdAt: now - 12 * DAY },
  ]
}

function read() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)) } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function scope(user) {
  if (!hasPermission(user, 'support.department') || !user.departmentId) throw new Error('No department tasks for this account.')
  return user.departmentId
}

export function subscribeToTasks(onChange) {
  const onStorage = (e) => { if (e.key === STORE_KEY) onChange() }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => { window.removeEventListener(CHANGE_EVENT, onChange); window.removeEventListener('storage', onStorage) }
}

export function listTasks(user) {
  const dept = scope(user)
  return (read()[dept] ?? seedFor(dept)).slice().sort((a, b) => a.due - b.due)
}

export function addTask(user, { title, description, priority, due }) {
  const dept = scope(user)
  const t = String(title ?? '').trim()
  if (!t) throw new Error('A task title is required.')
  if (t.length > 160) throw new Error('Title is too long.')
  const store = read()
  const list = store[dept] ?? seedFor(dept)
  list.push({
    id: `${dept}-t${Date.now()}`, title: t, description: String(description ?? '').trim().slice(0, 600),
    priority: TASK_PRIORITIES.includes(priority) ? priority : 'Medium', status: 'To do',
    due: due ? new Date(due).getTime() : Date.now() + 7 * DAY, createdBy: user.id, createdAt: Date.now(),
  })
  store[dept] = list
  write(store)
}

export function setTaskStatus(user, taskId, status) {
  const dept = scope(user)
  if (!TASK_STATUSES.includes(status)) throw new Error('Invalid status.')
  const store = read()
  const list = store[dept] ?? seedFor(dept)
  const task = list.find((x) => x.id === taskId)
  if (!task) throw new Error('Task not found.')
  task.status = status
  store[dept] = list
  write(store)
}
