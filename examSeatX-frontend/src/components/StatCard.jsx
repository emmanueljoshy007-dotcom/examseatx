/**
 * StatCard - A metric display card for the dashboard
 *
 * Props:
 * - title: Label text (e.g., "Total Students")
 * - value: The number or text to display prominently
 * - icon: A Lucide icon component
 * - color: Tailwind color class prefix (e.g., "blue", "green", "purple")
 * - subtitle: Small text below the value (optional)
 */
function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   icon: 'text-blue-400'   },
    green:  { bg: 'bg-green-500/10',  text: 'text-green-400',  icon: 'text-green-400'  },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: 'text-orange-400' },
    red:    { bg: 'bg-red-500/10',    text: 'text-red-400',    icon: 'text-red-400'    },
  }

  const colors = colorMap[color] || colorMap.blue

  return (
    <div className="card flex items-start gap-4">
      {/* Icon */}
      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={24} className={colors.icon} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${colors.text}`}>{value}</p>
        {subtitle && (
          <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default StatCard
