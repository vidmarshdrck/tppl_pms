import { ISSUE_CATEGORIES } from './ticketPriority.js'
export function readChats(user) {
  const raw = localStorage.getItem(`vpms-tazai-${user.id}`)
  if (!raw) return []
  const chats = JSON.parse(raw)
  if (!Array.isArray(chats)) throw new Error('Chat history could not be read.')
  return chats
}
export function saveChats(user, chats) {
  try { localStorage.setItem(`vpms-tazai-${user.id}`, JSON.stringify(chats)) }
  catch { throw new Error('This chat could not be saved. Free some browser storage and try again.') }
}
export function prepareTaskRequest(text, user, departments, attachments = []) {
  const mentioned = departments.find(department => new RegExp(`(?:to|for|assign(?:ed)? to) (?:the )?${department.name}|\\b${department.id} department\\b`, 'i').test(text))
  const categories = [[/print|toner/i, 'Printer Issues'], [/email|mailbox|outlook/i, 'Email Issues'], [/network|wi-?fi|internet|connection/i, 'Network'], [/password|login|log in|account|access/i, 'Account Access'], [/security|malware|virus/i, 'Security Issues'], [/laptop|computer|screen|keyboard|hardware/i, 'Hardware'], [/software|app|system|error/i, 'Software']]
  const own = departments.find(department => department.id === user.departmentId)?.name
  const affected = { Engineering: 'Maintenance', ICT: 'Administration', Procurement: 'Commercial', 'Product Monitoring': 'Operations', Safety: 'Operations' }[own] || own || ''
  return { title: text.trim().slice(0, 160), description: text.trim().slice(0, 600), departmentId: mentioned?.id || 'ict', affectedDepartment: affected, category: ISSUE_CATEGORIES.find(category => text.toLowerCase().includes(category.toLowerCase())) || categories.find(([pattern]) => pattern.test(text))?.[1] || '', attachments }
}
