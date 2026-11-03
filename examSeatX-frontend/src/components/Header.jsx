import { useLocation } from 'react-router-dom'
import { Bell, User } from 'lucide-react'

/**
 * Header - Top navigation bar
 *
 * Shows:
 * - Current page title (derived from route)
 * - Notification bell (placeholder)
 * - User avatar (placeholder for auth)
 */

const pageTitles = {
  '/':           'Dashboard',
  '/students':   'Student Management',
  '/classrooms': 'Classroom Configuration',
  '/exams':      'Exam Management',
  '/lookup':     'Seat Lookup',
}

function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'ExamSeatX'

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
      <div>
        <h2 className="text-slate-100 font-semibold text-lg">{title}</h2>
        <p className="text-slate-500 text-xs">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="text-slate-400 hover:text-slate-100 transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-slate-300">Admin</span>
        </button>
      </div>
    </header>
  )
}

export default Header
