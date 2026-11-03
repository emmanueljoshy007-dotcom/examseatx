/**
 * LoadingSpinner - Reusable loading indicator
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - message: Optional text below spinner
 */
function LoadingSpinner({ size = 'md', message }) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} border-slate-600 border-t-primary-500 rounded-full animate-spin`}
      />
      {message && (
        <p className="text-slate-400 text-sm">{message}</p>
      )}
    </div>
  )
}

export default LoadingSpinner
