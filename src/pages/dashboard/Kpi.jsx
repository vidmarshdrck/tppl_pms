import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { hasPermission } from '../../auth/permissions.js'

// One "KPI" sidebar entry. The tabs shown depend on the user's permissions:
// department heads/staff get KPI entry only (no tab bar); the GM and other
// org-wide roles get the register, and the GM also gets approvals.
const TABS = [
  { path: 'entry', label: 'KPI entry', permission: 'kpi.submit' },
  { path: 'register', label: 'KPI register', permission: 'dashboard.org' },
  { path: 'approvals', label: 'Approvals', permission: 'kpi.approve' },
]

function useTabs() {
  const { user } = useAuth()
  return TABS.filter((tab) => hasPermission(user, tab.permission))
}

export function KpiIndex() {
  const tabs = useTabs()
  return tabs.length ? <Navigate to={tabs[0].path} replace /> : <Navigate to="/" replace />
}

export default function Kpi() {
  const tabs = useTabs()
  return (
    <div className="space-y-5">
      {tabs.length > 1 && (
        <div className="flex gap-1 border-b border-slate-200" role="tablist" aria-label="KPI sections">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              role="tab"
              className={({ isActive }) => `px-4 py-2 text-sm font-medium -mb-px border-b-2 ${isActive ? 'border-[#B42318] text-[#B42318]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}
      <Outlet />
    </div>
  )
}
