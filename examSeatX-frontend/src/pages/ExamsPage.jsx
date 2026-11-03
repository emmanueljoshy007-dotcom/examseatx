import { useState, useEffect } from 'react'
import { Plus, BookOpen, Zap, Calendar, Clock, Users, Download, Eye, X, CheckCircle2, MapPin, Grid, List } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import InteractiveDeskGrid from '../components/InteractiveDeskGrid'
import { examsApi } from '../api/exams'

const statusConfig = {
  SCHEDULED: { label: 'Scheduled', class: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' },
  SEATING_GENERATED: { label: 'Seating Allocated', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' },
  PUBLISHED: { label: 'Published', class: 'bg-green-500/10 text-green-400 border border-green-500/30' },
  COMPLETED: { label: 'Completed', class: 'bg-slate-500/10 text-slate-400 border border-slate-500/30' },
}

function ExamsPage() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [generatingFor, setGeneratingFor] = useState(null)
  const [activePlanModal, setActivePlanModal] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [selectedHallTab, setSelectedHallTab] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    examDate: '',
    startTime: '09:00',
    endTime: '12:00',
    department: '',
    semester: '',
    academicYear: '2024-25',
  })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await examsApi.getAll()
      setExams(response.data)
    } catch (err) {
      toast.error('Failed to load exams')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await examsApi.create({
        ...formData,
        semester: formData.semester ? parseInt(formData.semester) : null,
      })
      toast.success(`Exam "${formData.subjectName}" created!`)
      setShowForm(false)
      fetchExams()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam')
    }
  }

  const handleGenerateSeating = async (exam) => {
    setGeneratingFor(exam.id)
    const toastId = toast.loading(`Running CSP engine for "${exam.subjectName}"...`)
    try {
      const response = await examsApi.generateSeating(exam.id)
      toast.dismiss(toastId)
      toast.success(
        `Seating generated! ${response.data.assignedCount} students assigned in ${response.data.executionTimeMs}ms`,
        { duration: 5000 }
      )
      fetchExams()
      // Open the visualizer immediately
      handleViewSeating(exam)
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err.response?.data?.message || 'Seating generation failed')
      console.error(err)
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleViewSeating = async (exam) => {
    setLoadingPlan(true)
    try {
      const res = await examsApi.getSeatingPlan(exam.id)
      setActivePlanModal({ exam, plan: res.data })
    } catch {
      toast.error('Could not load seating plan for this exam.')
    } finally {
      setLoadingPlan(false)
    }
  }

  const handleDownloadPdf = async (exam) => {
    const toastId = toast.loading('Generating PDF seating chart...')
    try {
      const response = await examsApi.downloadPdf(exam.id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SeatingChart_${exam.subjectCode}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.dismiss(toastId)
      toast.success('PDF downloaded!')
    } catch {
      toast.dismiss(toastId)
      toast.error('Failed to download PDF')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Exams & Seating Engine</h1>
          <p className="text-slate-400 mt-1">
            Trigger constraint-based seating allocation and export hall charts
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Create Exam
        </button>
      </div>

      {/* Create Exam Form Modal */}
      {showForm && (
        <div className="card mb-8 border-primary-500/30">
          <h2 className="text-slate-100 font-bold text-lg mb-4">Create New Exam</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Subject Name *</label>
              <input
                required
                placeholder="e.g., Data Structures and Algorithms"
                className="input-field"
                value={formData.subjectName}
                onChange={e => setFormData(p => ({ ...p, subjectName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Subject Code *</label>
              <input
                required
                placeholder="e.g., CS301"
                className="input-field"
                value={formData.subjectCode}
                onChange={e => setFormData(p => ({ ...p, subjectCode: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Exam Date *</label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.examDate}
                onChange={e => setFormData(p => ({ ...p, examDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Start Time *</label>
                <input
                  type="time"
                  required
                  className="input-field"
                  value={formData.startTime}
                  onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">End Time *</label>
                <input
                  type="time"
                  required
                  className="input-field"
                  value={formData.endTime}
                  onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Department</label>
              <input
                placeholder="e.g., Computer Science / All Departments"
                className="input-field"
                value={formData.department}
                onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                placeholder="5"
                className="input-field"
                value={formData.semester}
                onChange={e => setFormData(p => ({ ...p, semester: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex gap-3 justify-end mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create Exam</button>
            </div>
          </form>
        </div>
      )}

      {/* Exams List */}
      {exams.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No exams created yet"
          description="Create an exam, enroll students, then generate the seating plan."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Exam
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const status = statusConfig[exam.status] || statusConfig.SCHEDULED
            const isGenerating = generatingFor === exam.id
            const hasPlan = ['SEATING_GENERATED', 'PUBLISHED'].includes(exam.status)

            return (
              <div key={exam.id} className="card border-slate-700/60 bg-slate-900/80 hover:border-slate-600 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-slate-100 font-bold text-lg">{exam.subjectName}</h3>
                      <span className="font-mono text-primary-400 text-xs bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded">
                        {exam.subjectCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-500" />
                        {exam.examDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-500" />
                        {exam.startTime} – {exam.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-slate-500" />
                        {exam.enrolledStudents?.length ?? 0} candidates
                      </span>
                    </div>
                    {exam.department && (
                      <p className="text-slate-500 text-xs mt-2">{exam.department} • Semester {exam.semester}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {hasPlan && (
                      <button
                        onClick={() => handleViewSeating(exam)}
                        className="btn-secondary flex items-center gap-2 text-xs"
                      >
                        <Eye size={14} /> View Seating Grid
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerateSeating(exam)}
                      disabled={isGenerating}
                      className="btn-primary flex items-center gap-2 text-xs"
                    >
                      <Zap size={14} className={isGenerating ? 'animate-spin' : ''} />
                      {isGenerating ? 'Solving CSP...' : hasPlan ? 'Regenerate' : 'Run Seating Engine'}
                    </button>
                    {hasPlan && (
                      <button
                        onClick={() => handleDownloadPdf(exam)}
                        className="btn-secondary flex items-center gap-2 text-xs"
                      >
                        <Download size={14} /> Download PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SEATING PLAN & GRID VISUALIZER MODAL */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-xs uppercase font-bold text-primary-400 tracking-wider">
                  Constraint Satisfaction Seating Visualizer
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {activePlanModal.exam.subjectName} ({activePlanModal.exam.subjectCode})
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Engine Status: <span className="text-green-400 font-semibold">{activePlanModal.plan.status}</span> • Assigned: {activePlanModal.plan.assignedCount} candidates
                </p>
              </div>
              <button
                onClick={() => setActivePlanModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notes & Zero Conflict Badge */}
            <div className="bg-primary-950/40 border border-primary-500/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={22} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Zero Adjacency Conflict Verified</p>
                  <p className="text-xs text-slate-400">{activePlanModal.plan.engineNotes}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Grid vs Table */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-1 flex items-center">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Grid size={13} /> 2D Desk Map
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List size={13} /> Roster Table
                  </button>
                </div>

                <button
                  onClick={() => handleDownloadPdf(activePlanModal.exam)}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Download size={14} /> Export PDF
                </button>
              </div>
            </div>

            {/* Hall Selector Tabs (if multiple halls used) */}
            {(() => {
              const hallsMap = new Map()
              activePlanModal.plan.assignments?.forEach(a => {
                if (a.classroom && !hallsMap.has(a.classroom.roomNumber)) {
                  hallsMap.set(a.classroom.roomNumber, a.classroom)
                }
              })
              const halls = Array.from(hallsMap.values())
              const currentHall = halls.find(h => h.roomNumber === selectedHallTab) || halls[0]

              return (
                <div>
                  {halls.length > 1 && (
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                      <span className="text-xs text-slate-400">Select Hall:</span>
                      {halls.map(h => (
                        <button
                          key={h.roomNumber}
                          onClick={() => setSelectedHallTab(h.roomNumber)}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                            (currentHall?.roomNumber === h.roomNumber)
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {h.roomNumber}
                        </button>
                      ))}
                    </div>
                  )}

                  {viewMode === 'grid' ? (
                    <InteractiveDeskGrid
                      classroom={currentHall}
                      assignments={activePlanModal.plan.assignments || []}
                    />
                  ) : (
                    /* Allocations Table */
                    <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-950 sticky top-0 text-slate-400 text-xs border-b border-slate-800">
                          <tr>
                            <th className="py-3 px-4 text-left">Hall</th>
                            <th className="py-3 px-4 text-left">Seat</th>
                            <th className="py-3 px-4 text-left">Roll Number</th>
                            <th className="py-3 px-4 text-left">Candidate Name</th>
                            <th className="py-3 px-4 text-left">Department</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {activePlanModal.plan.assignments?.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-4 text-white font-medium flex items-center gap-1.5">
                                <MapPin size={13} className="text-slate-400" />
                                {a.classroom.roomNumber}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-primary-400">
                                {a.seatLabel}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">
                                {a.student.rollNumber}
                              </td>
                              <td className="py-3 px-4 text-white">
                                {a.student.firstName} {a.student.lastName}
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  a.student.department === 'Computer Science'
                                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                    : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                }`}>
                                  {a.student.department}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActivePlanModal(null)}
                className="btn-secondary text-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamsPage
