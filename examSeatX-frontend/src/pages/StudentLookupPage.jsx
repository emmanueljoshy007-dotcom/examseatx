import { useState } from 'react'
import { Search, MapPin, Clock, BookOpen, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { studentsApi } from '../api/students'

/**
 * StudentLookupPage - Public-facing page for students to find their exact hall & seat.
 */
function StudentLookupPage() {
  const [rollNumber, setRollNumber] = useState('')
  const [seatResults, setSeatResults] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    const cleanRoll = rollNumber.trim().toUpperCase()
    if (!cleanRoll) return

    setLoading(true)
    setError(null)
    setSeatResults(null)
    setStudentInfo(null)

    try {
      // 1. Try to fetch the active seat assignment(s)
      const seatRes = await studentsApi.lookupSeat(cleanRoll)
      if (seatRes.data && seatRes.data.length > 0) {
        setSeatResults(seatRes.data)
      } else {
        // Fallback: check if the student exists
        await checkStudentFallback(cleanRoll)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        await checkStudentFallback(cleanRoll)
      } else {
        setError('Unable to reach the server. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const checkStudentFallback = async (cleanRoll) => {
    try {
      const studentRes = await studentsApi.getByRollNumber(cleanRoll)
      setStudentInfo(studentRes.data)
      setSeatResults([])
    } catch {
      setError(`No student found with Roll Number "${cleanRoll}". Please check your ID and try again.`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/20">
          <GraduationCap size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">ExamSeatX</h1>
        <p className="text-slate-400 mt-2">Instant Student Examination Hall & Seat Lookup</p>
      </div>

      {/* Search Input Box */}
      <div className="w-full max-w-xl">
        <form onSubmit={handleSearch} className="card shadow-xl border-slate-700/60 bg-slate-900/90 mb-6">
          <label className="block text-slate-200 font-semibold text-sm mb-2">
            Enter Your University Roll Number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. CS2022001 or EC2022001"
              className="input-field font-mono uppercase text-base"
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !rollNumber.trim()}
              className="btn-primary flex items-center gap-2 px-6 whitespace-nowrap font-semibold shadow-md"
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Find My Seat'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Tip: Try roll numbers like <span className="text-primary-400 font-mono">CS2022001</span> or <span className="text-primary-400 font-mono">EC2022001</span>.
          </p>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Candidate Not Found</p>
              <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Student Exists But No Active Plan Yet */}
        {studentInfo && seatResults && seatResults.length === 0 && (
          <div className="card border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold">{studentInfo.firstName} {studentInfo.lastName}</h3>
                <p className="text-xs text-slate-400 font-mono">{studentInfo.rollNumber} • {studentInfo.department}</p>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3 text-sm text-amber-300/90">
              Your profile is verified, but your examination seating plan has not been generated or published yet.
              Please check back shortly or contact the exam controller.
            </div>
          </div>
        )}

        {/* SEAT FOUND: Display Room, Seat, Exam & QR Code */}
        {seatResults && seatResults.length > 0 && (
          <div className="space-y-6 animate-slide-up">
            {seatResults.map((seat, idx) => (
              <div key={idx} className="card border-primary-500/40 bg-slate-900 shadow-2xl relative overflow-hidden">
                {/* Decorative highlight banner */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500" />

                {/* Candidate header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{seat.studentName}</h2>
                      <p className="text-sm text-slate-400 font-mono">
                        Roll No: <span className="text-primary-400 font-semibold">{seat.rollNumber}</span> • {seat.department}
                      </p>
                    </div>
                  </div>
                  <span className="badge-success flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={14} /> Confirmed Seat
                  </span>
                </div>

                {/* BIG SEATING HIGHLIGHT BOX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Classroom / Hall Details */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary-400" /> Classroom / Hall
                      </span>
                      {seat.floor != null && (
                        <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                          Floor {seat.floor}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-white tracking-wide">{seat.roomNumber}</p>
                      <p className="text-xs text-slate-400 mt-1">{seat.building || 'Main Campus Block'}</p>
                    </div>
                  </div>

                  {/* Seat Label & Bench Index */}
                  <div className="bg-primary-950/40 border border-primary-600/30 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">
                        Allocated Seat
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-primary-900/60 text-primary-200 rounded">
                        Row {seat.row + 1}, Col {seat.col + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-primary-400 font-mono tracking-wider">{seat.seatLabel}</p>
                      <p className="text-xs text-slate-400 mt-1">Zero-Adjacency Verified</p>
                    </div>
                  </div>
                </div>

                {/* Exam Details Box */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <BookOpen size={14} className="text-indigo-400" /> Examination Details
                  </div>
                  <p className="text-base font-semibold text-slate-100">{seat.subjectName}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="font-mono text-primary-400 font-medium">Code: {seat.subjectCode}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-500" />
                      {seat.examDate} • {seat.startTime} - {seat.endTime}
                    </span>
                  </div>
                </div>

                {/* Scannable Verification QR Code */}
                {seat.qrCodeData && (
                  <div className="border-t border-slate-800/80 pt-5 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/50 border-4 border-slate-800">
                      <QRCodeSVG
                        value={seat.qrCodeData}
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-3 font-medium">
                      Show this QR Code to invigilator at the entrance for instant hall verification
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentLookupPage
