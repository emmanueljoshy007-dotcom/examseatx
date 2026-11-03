import { useState, useEffect } from 'react'
import { Monitor, Clock, Calendar, MapPin, Users, Search, Maximize2, Minimize2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { examsApi } from '../api/exams'

/**
 * DigitalNoticeBoardPage - Module 9: User Feedback & Display Module
 *
 * Designed specifically for large monitors, TV kiosks, and projection screens
 * in the university examination entrance lobby.
 *
 * Shows real-time hall assignments, roll number ranges, and schedules.
 */
export default function DigitalNoticeBoardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [exams, setExams] = useState([])
  const [selectedExamId, setSelectedExamId] = useState(null)
  const [hallSummaries, setHallSummaries] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch exams and plans
  useEffect(() => {
    async function loadData() {
      try {
        const res = await examsApi.getAll()
        setExams(res.data)
        if (res.data.length > 0) {
          // Select first exam with seating generated or first exam
          const activeExam = res.data.find(e => ['SEATING_GENERATED', 'PUBLISHED'].includes(e.status)) || res.data[0]
          setSelectedExamId(activeExam.id)
          loadExamPlan(activeExam.id)
        }
      } catch (err) {
        console.error('Failed to load exams', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const loadExamPlan = async (examId) => {
    try {
      const planRes = await examsApi.getSeatingPlan(examId)
      const assignments = planRes.data?.assignments || []

      // Group assignments by Classroom
      const map = new Map()
      assignments.forEach((a) => {
        const room = a.classroom?.roomNumber || 'Unknown'
        if (!map.has(room)) {
          map.set(room, {
            roomNumber: room,
            building: a.classroom?.building || 'Main Block',
            floor: a.classroom?.floor ?? 1,
            students: [],
            departments: new Set(),
          })
        }
        const entry = map.get(room)
        entry.students.push(a.student)
        if (a.student?.department) entry.departments.add(a.student.department)
      })

      // Calculate roll number ranges per hall
      const summaries = Array.from(map.values()).map((entry) => {
        // Sort students by roll number
        entry.students.sort((s1, s2) => s1.rollNumber.localeCompare(s2.rollNumber))
        const firstRoll = entry.students[0]?.rollNumber || '—'
        const lastRoll = entry.students[entry.students.length - 1]?.rollNumber || '—'
        return {
          roomNumber: entry.roomNumber,
          building: entry.building,
          floor: entry.floor,
          departments: Array.from(entry.departments).join(', '),
          rollRange: firstRoll === lastRoll ? firstRoll : `${firstRoll} → ${lastRoll}`,
          totalCandidates: entry.students.length,
          allRolls: entry.students.map(s => s.rollNumber).join(' '),
        }
      })

      setHallSummaries(summaries)
    } catch {
      setHallSummaries([])
    }
  }

  const handleExamChange = (examId) => {
    setSelectedExamId(examId)
    loadExamPlan(examId)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const selectedExam = exams.find(e => e.id === Number(selectedExamId))

  const filteredSummaries = hallSummaries.filter((h) =>
    h.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.departments.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.allRolls.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 flex flex-col justify-between">
      {/* Top Banner & Clock */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Live Examination Hall Notice Board
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">
                ExamSeatX Digital Display
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Clock */}
            <div className="bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-lg">
              <div className="text-right">
                <p className="text-xs text-slate-400 flex items-center justify-end gap-1">
                  <Calendar size={12} />
                  {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xl font-bold font-mono text-primary-400 tracking-wider">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
              <Clock size={24} className="text-slate-500" />
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-slate-400 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        {/* Filter & Active Session Header */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
            {/* Exam selector */}
            <select
              value={selectedExamId || ''}
              onChange={(e) => handleExamChange(e.target.value)}
              className="input-field bg-slate-900 text-sm font-semibold max-w-sm"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.subjectCode} - {ex.subjectName}
                </option>
              ))}
            </select>

            {/* Quick roll search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Quick filter by Roll Number or Room (e.g. CS2022001 or EH-101)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 text-sm"
              />
            </div>
          </div>

          {/* Exam time badge */}
          {selectedExam && (
            <div className="bg-primary-950/40 border border-primary-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-primary-300 font-semibold uppercase">Exam Session</p>
                <p className="text-sm font-bold text-white">{selectedExam.subjectName}</p>
              </div>
              <span className="text-xs font-mono font-bold text-primary-400 bg-primary-900/50 px-2 py-1 rounded">
                {selectedExam.startTime} - {selectedExam.endTime}
              </span>
            </div>
          )}
        </div>

        {/* Notice Board Cards / Table */}
        {loading ? (
          <p className="text-center py-20 text-slate-500">Loading hall allocations...</p>
        ) : filteredSummaries.length === 0 ? (
          <div className="card text-center py-16 border-dashed border-slate-800">
            <Monitor size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-lg font-bold text-slate-300">No Seating Allocated Yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Run the CSP seating engine on the Exams page to publish the allocation to this board.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSummaries.map((hall, idx) => (
              <div
                key={idx}
                className="card border-slate-800 bg-slate-900/90 shadow-2xl relative overflow-hidden flex flex-col justify-between hover:border-primary-500/50 transition-all duration-200"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-indigo-500" />

                <div>
                  {/* Hall Title & Floor */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{hall.roomNumber}</h2>
                        <p className="text-xs text-slate-400">{hall.building} • Floor {hall.floor}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5">
                      <Users size={12} className="text-primary-400" />
                      {hall.totalCandidates} Seats
                    </span>
                  </div>

                  {/* Roll Range Callout */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 my-3 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Roll Number Range
                    </span>
                    <p className="text-lg font-mono font-extrabold text-primary-400 tracking-wide mt-1">
                      {hall.rollRange}
                    </p>
                  </div>

                  {/* Departments seated */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400">Departments:</span>
                    <p className="text-xs text-slate-200 font-medium mt-0.5">{hall.departments}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Entry: North Gate</span>
                  <span className="text-emerald-400 font-medium">Invigilator Assigned</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-10 pt-4 border-t border-slate-900 text-center text-xs text-slate-600">
        ExamSeatX Intelligent Hall Management System • Candidates must be seated 15 minutes before the exam commences.
      </footer>
    </div>
  )
}

