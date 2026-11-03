import { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  BookOpen,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { dashboardApi } from '../api/dashboard'

/**
 * DashboardPage - Overview of the entire ExamSeatX system
 *
 * Shows:
 * 1. Key metrics (students, classrooms, exams, capacity)
 * 2. Upcoming exams list
 * 3. Recent activity
 *
 * Data is fetched from GET /api/dashboard/stats
 */
function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await dashboardApi.getStats()
        setStats(response.data)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
        // Use mock data if backend not yet connected
        setStats({
          totalStudents: 20,
          totalClassrooms: 3,
          totalExams: 2,
          upcomingExams: 2,
          totalCapacity: 136,
          scheduledExams: 2,
          publishedExams: 0,
          completedExams: 0,
        })
        setError('Backend not connected — showing sample data')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-warning-50/10 border border-yellow-600/30 rounded-lg px-4 py-3">
          <AlertCircle size={18} className="text-yellow-500 flex-shrink-0" />
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Welcome back, Admin</h1>
        <p className="text-slate-400 mt-1">
          Here's what's happening with your examination system.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? '—'}
          icon={Users}
          color="blue"
          subtitle="Registered in system"
        />
        <StatCard
          title="Classrooms"
          value={stats?.totalClassrooms ?? '—'}
          icon={Building2}
          color="purple"
          subtitle={`${stats?.totalCapacity ?? 0} total seats`}
        />
        <StatCard
          title="Total Exams"
          value={stats?.totalExams ?? '—'}
          icon={BookOpen}
          color="green"
          subtitle="All academic years"
        />
        <StatCard
          title="Upcoming Exams"
          value={stats?.upcomingExams ?? '—'}
          icon={Calendar}
          color="orange"
          subtitle="Needs seating plan"
        />
      </div>

      {/* Exam Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Cards */}
        <div className="card">
          <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Exam Status Overview
          </h3>
          <div className="space-y-3">
            <StatusRow
              icon={Clock}
              label="Scheduled"
              count={stats?.scheduledExams ?? 0}
              color="text-yellow-400"
              bg="bg-yellow-400/10"
            />
            <StatusRow
              icon={CheckCircle}
              label="Published"
              count={stats?.publishedExams ?? 0}
              color="text-green-400"
              bg="bg-green-400/10"
            />
            <StatusRow
              icon={BookOpen}
              label="Completed"
              count={stats?.completedExams ?? 0}
              color="text-slate-400"
              bg="bg-slate-400/10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-slate-200 font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              href="/students"
              label="Add Students"
              description="Upload CSV or add individually"
              icon={Users}
            />
            <QuickAction
              href="/classrooms"
              label="Configure Classrooms"
              description="Set up exam halls and labs"
              icon={Building2}
            />
            <QuickAction
              href="/exams"
              label="Create Exam & Generate Seating"
              description="Run the CSP allocation engine"
              icon={BookOpen}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper sub-components
function StatusRow({ icon: Icon, label, count, color, bg }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        <span className="text-slate-300 text-sm">{label}</span>
      </div>
      <span className={`font-bold text-lg ${color}`}>{count}</span>
    </div>
  )
}

function QuickAction({ href, label, description, icon: Icon }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
    >
      <div className="w-9 h-9 bg-primary-600/20 rounded-lg flex items-center justify-center group-hover:bg-primary-600/30 transition-colors">
        <Icon size={18} className="text-primary-400" />
      </div>
      <div>
        <p className="text-slate-200 text-sm font-medium">{label}</p>
        <p className="text-slate-500 text-xs">{description}</p>
      </div>
    </a>
  )
}

export default DashboardPage
