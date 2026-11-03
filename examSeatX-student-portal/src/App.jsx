import { useState } from 'react'
import { Search, MapPin, Clock, BookOpen, GraduationCap, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { studentsApi } from './api/students'

function App() {
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
      // 1. Fetch active seat assignment from production API
      const seatRes = await studentsApi.lookupSeat(cleanRoll)
      if (seatRes.data && seatRes.data.length > 0) {
        setSeatResults(seatRes.data)
      } else {
        // Fallback: check if the student exists in system
        await checkStudentFallback(cleanRoll)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        await checkStudentFallback(cleanRoll)
      } else {
        setError('Unable to connect to the examination server. Please ensure you have an active internet connection.')
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
      setError(`No candidate record found for Roll Number "${cleanRoll}". Please verify your Roll Number with the Examination Branch.`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4 py-8 md:py-16">
      {/* Portal Branding Header */}
      <div className="text-center mb-8 max-w-lg">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-600/30">
          <GraduationCap size={34} className="text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck size={14} /> Student Candidate Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Exam Seat Lookup
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Enter your university Roll Number to find your allocated examination hall, desk coordinates, and security check-in QR code.
        </p>
      </div>

      {/* Search Box Card */}
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. CS2022001"
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !rollNumber.trim()}
            className="px-6 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              'Find My Seat'
            )}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
      </div>

      {/* Results View */}
      <div className="w-full max-w-lg">
        {/* Case 1: Student exists, but seating is not generated yet */}
        {studentInfo && seatResults && seatResults.length === 0 && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock size={24} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Welcome, {studentInfo.firstName} {studentInfo.lastName}
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Roll No: {studentInfo.rollNumber} • {studentInfo.department} (Sem {studentInfo.semester})
            </p>
            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs text-amber-300">
              Your seating plan has not been generated by the Examination Controller yet. Please check back closer to the exam time.
            </div>
          </div>
        )}

        {/* Case 2: Seat Allocation Found! */}
        {seatResults && seatResults.length > 0 && (
          <div className="space-y-6 animate-fadeIn">
            {seatResults.map((seat, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative glowing gradient top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary-500 to-indigo-500" />

                {/* Candidate Info Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">{seat.studentName}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Roll No: <span className="text-primary-400 font-semibold">{seat.rollNumber}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 size={13} /> Seat Confirmed
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{seat.department} • Sem {seat.semester}</p>
                  </div>
                </div>

                {/* Room & Seat High-Impact Callout Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Hall Card */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                      <MapPin size={15} className="text-primary-400" />
                      <span>Exam Hall</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white tracking-wide">{seat.classroomNumber}</p>
                      <p className="text-xs text-slate-400 mt-1">{seat.building || 'Main Campus'} • Floor {seat.floor ?? 1}</p>
                    </div>
                  </div>

                  {/* Desk Card */}
                  <div className="bg-slate-950/70 border border-primary-500/30 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary-400 mb-2">
                      <GraduationCap size={15} />
                      <span>Desk & Seat</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-primary-400 font-mono tracking-wider">{seat.seatLabel}</p>
                      <p className="text-[11px] text-emerald-400/90 mt-1 font-medium">Row {seat.gridRow}, Col {seat.gridCol}</p>
                    </div>
                  </div>
                </div>

                {/* Exam Details Card */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <BookOpen size={14} className="text-indigo-400" /> Subject Details
                  </div>
                  <p className="text-base font-semibold text-slate-100">{seat.subjectName}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="font-mono text-primary-400 font-medium">Code: {seat.subjectCode}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-500" />
                      {seat.examDate} • {seat.startTime} - {seat.endTime}
                    </span>
                  </div>
                </div>

                {/* Scannable Verification QR Code for Hall Entrance */}
                {seat.qrCodeData && (
                  <div className="border-t border-slate-800/80 pt-5 flex flex-col items-center">
                    <div className="bg-white p-3.5 rounded-2xl shadow-xl shadow-black/50 border-4 border-slate-800">
                      <QRCodeSVG
                        value={seat.qrCodeData}
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-3 font-medium text-center max-w-xs">
                      Present this QR Code to the gate invigilator camera for entrance verification.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-400">
        <p>ExamSeatX Automated Hall Seating System • Candidate Portal</p>
      </footer>
    </div>
  )
}

export default App
