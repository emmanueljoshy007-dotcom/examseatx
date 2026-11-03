import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  Search,
  GraduationCap,
  Monitor,
  QrCode
} from 'lucide-react'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard',      exact: true },
  { to: '/students',     icon: Users,           label: 'Students'                   },
  { to: '/classrooms',   icon: Building2,        label: 'Classrooms'                 },
  { to: '/exams',        icon: BookOpen,         label: 'Exams'                      },
  { to: '/notice-board', icon: Monitor,          label: 'Notice Board'               },
  { to: '/scanner',      icon: QrCode,           label: 'Gate Scanner'               },
  { to: '/lookup',       icon: Search,           label: 'Student Lookup'             },
]

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">ExamSeatX</h1>
          <p className="text-slate-400 text-xs mt-0.5">Seating System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">Phase 1 & 2 — Dev Build</p>
        <p className="text-slate-600 text-xs mt-0.5">v1.0.0-SNAPSHOT</p>
      </div>
    </aside>
  )
}

export default Sidebar
