import { NavLink, useLocation } from 'react-router'
import {
  LayoutDashboard, FolderKanban, Activity, Target,
  AlertTriangle, FileText, Bot, FileOutput, LogOut, ChevronLeft, Scale, CreditCard
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const topNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/civil-society', icon: Scale, label: 'Civil Society OS' },
]

const projectNav = [
  { path: '', icon: LayoutDashboard, label: 'Overview' },
  { path: '/activities', icon: Activity, label: 'Activities' },
  { path: '/indicators', icon: Target, label: 'Indicators' },
  { path: '/risks', icon: AlertTriangle, label: 'Risks' },
  { path: '/documents', icon: FileText, label: 'Documents' },
  { path: '/agents', icon: Bot, label: 'AI Agents' },
  { path: '/outputs', icon: FileOutput, label: 'Outputs' },
]

export function Sidebar() {
  const { signOut } = useAuth()
  const location = useLocation()
  const projectMatch = location.pathname.match(/^\/projects\/([^/]+)/)
  const id = projectMatch?.[1]
  const inProject = Boolean(id)

  return (
    <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">Intelligence</p>
            <p className="text-xs text-muted-foreground">Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {topNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              cn('flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {inProject && (
          <>
            <div className="pt-4 pb-1 px-3">
              <NavLink
                to="/projects"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                All projects
              </NavLink>
              <p className="text-xs font-medium text-foreground mt-2 truncate">Project</p>
            </div>
            {projectNav.map(({ path, icon: Icon, label }) => {
              const to = `/projects/${id}${path}`
              const isActive = path === ''
                ? location.pathname === `/projects/${id}`
                : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={path === ''}
                  className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </NavLink>
              )
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-border space-y-0.5">
        <NavLink
          to="/billing"
          className={({ isActive }) =>
            cn('flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )
          }
        >
          <CreditCard className="w-4 h-4 flex-shrink-0" />
          Billing
        </NavLink>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
