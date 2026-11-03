import { Inbox } from 'lucide-react'

/**
 * EmptyState - Shown when a list/table has no data
 *
 * Props:
 * - icon: Lucide icon component (default: Inbox)
 * - title: Main message (e.g., "No students found")
 * - description: Subtitle text
 * - action: Optional JSX for a CTA button
 */
function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'Get started by adding your first item.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-500" />
      </div>
      <h3 className="text-slate-200 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}

export default EmptyState
