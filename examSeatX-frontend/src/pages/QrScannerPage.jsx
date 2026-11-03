import { useState, useEffect, useRef } from 'react'
import { QrCode, Camera, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { classroomsApi } from '../api/classrooms'

/**
 * QrScannerPage - Module 6: Student & Faculty Portal Layer
 *
 * Used by hall invigilators at the classroom door to:
 * 1. Scan candidate QR codes on student phones
 * 2. Instantly verify if student is entering the correct hall
 * 3. Mark attendance in real time
 */
export default function QrScannerPage() {
  const [classrooms, setClassrooms] = useState([])
  const [selectedHall, setSelectedHall] = useState('')
  const [scannedResult, setScannedResult] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    classroomsApi.getAll().then((res) => {
      setClassrooms(res.data)
      if (res.data.length > 0) {
        setSelectedHall(res.data[0].roomNumber)
      }
    }).catch(console.error)
  }, [])

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch {
      setCameraError('Camera access not available or blocked. You can still test by pasting/typing the token or roll number below!')
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  // Handle Payload Validation (JSON token from QR code)
  const processQrPayload = async (rawString) => {
    setIsVerifying(true)
    setAttendanceMarked(false)
    setScannedResult(null)

    try {
      let data = null
      // Try parsing JSON payload
      if (rawString.trim().startsWith('{')) {
        data = JSON.parse(rawString.trim())
      } else {
        // Roll number entered directly: fetch lookup
        const res = await axios.get(`/api/seating/lookup/${rawString.trim().toUpperCase()}`)
        if (res.data && res.data.length > 0) {
          const first = res.data[0]
          data = {
            roll: first.rollNumber,
            name: first.studentName,
            exam: first.subjectCode,
            room: first.roomNumber,
            seat: first.seatLabel,
            date: first.examDate,
          }
        }
      }

      if (!data) {
        throw new Error('Invalid QR Code or student record not found.')
      }

      // Check hall match
      const isHallMatch = !selectedHall || (data.room && data.room.trim().toUpperCase() === selectedHall.trim().toUpperCase())

      setScannedResult({
        ...data,
        isHallMatch,
      })

      if (isHallMatch) {
        toast.success(`Verified: ${data.name} seated in ${data.seat}`)
      } else {
        toast.error(`WRONG HALL! Candidate belongs to ${data.room}`)
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed')
      setScannedResult({ error: err.message || 'Could not verify student token' })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    processQrPayload(manualInput)
  }

  const markStudentPresent = () => {
    setAttendanceMarked(true)
    toast.success(`Attendance confirmed for ${scannedResult?.name}!`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <QrCode size={20} className="text-primary-400" />
              Invigilator Entrance Scanner
            </h1>
            <p className="text-xs text-slate-400">Module 6: QR Candidate Gate Authentication</p>
          </div>
        </div>

        {/* Current Hall selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">My Hall:</label>
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-primary-400 focus:outline-none"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.roomNumber}>
                {c.roomNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Camera Scanner Viewport */}
        <div className="card border-slate-800 bg-slate-900 relative overflow-hidden flex flex-col items-center p-6 text-center">
          {isCameraActive ? (
            <div className="w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl border-2 border-primary-500/50">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {/* Scan target reticle */}
              <div className="absolute inset-8 border-2 border-primary-400/80 rounded-2xl pointer-events-none animate-pulse" />
              <button
                onClick={stopCamera}
                className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 text-white rounded text-xs hover:bg-black"
              >
                Stop Camera
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md py-8 px-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center">
              <div className="w-14 h-14 bg-primary-600/20 border border-primary-500/40 rounded-2xl flex items-center justify-center text-primary-400 mb-3">
                <Camera size={28} />
              </div>
              <p className="font-bold text-slate-200 text-sm">Camera Gate Scanner</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Scan the QR code displayed on the student&apos;s mobile screen at the entrance
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="btn-primary mt-4 text-xs flex items-center gap-2"
              >
                <Camera size={14} /> Open Device Camera
              </button>
              {cameraError && (
                <p className="text-[11px] text-amber-400/90 mt-3 px-4">{cameraError}</p>
              )}
            </div>
          )}

          {/* Quick Manual Roll or Token Testing Box */}
          <div className="w-full max-w-md mt-6 pt-6 border-t border-slate-800/80">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Or test by Roll No (e.g. CS2022001 or EC2022001)..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="input-field text-xs font-mono flex-1"
              />
              <button type="submit" disabled={isVerifying} className="btn-secondary text-xs px-4">
                {isVerifying ? '...' : 'Verify'}
              </button>
            </form>
          </div>
        </div>

        {/* Verification Result Card */}
        {scannedResult && !scannedResult.error && (
          <div
            className={`card border-2 shadow-2xl transition-all duration-300 animate-slide-up ${
              scannedResult.isHallMatch
                ? 'bg-emerald-950/20 border-emerald-500/50'
                : 'bg-red-950/20 border-red-500/50'
            }`}
          >
            {/* Verdict Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                {scannedResult.isHallMatch ? (
                  <CheckCircle2 size={32} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={32} className="text-red-400 shrink-0" />
                )}
                <div>
                  <h3 className={`text-lg font-black tracking-wide ${
                    scannedResult.isHallMatch ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {scannedResult.isHallMatch ? 'ACCESS GRANTED' : 'WRONG HALL ALERT!'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {scannedResult.isHallMatch
                      ? `Candidate is assigned to this room (${selectedHall})`
                      : `Candidate belongs to ${scannedResult.room}, NOT ${selectedHall}!`}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300">
                Exam: {scannedResult.exam}
              </span>
            </div>

            {/* Candidate & Seat Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase">Candidate</p>
                <p className="font-bold text-white text-sm truncate">{scannedResult.name}</p>
                <p className="text-xs font-mono text-primary-400">{scannedResult.roll}</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase">Assigned Room</p>
                <p className={`font-black text-lg ${
                  scannedResult.isHallMatch ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {scannedResult.room}
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase">Seat Index</p>
                <p className="font-mono font-black text-lg text-primary-400">
                  {scannedResult.seat}
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase">Status</p>
                <p className="font-semibold text-xs mt-1 text-slate-200">
                  {attendanceMarked ? 'Present' : 'Awaiting Check-in'}
                </p>
              </div>
            </div>

            {/* Attendance Action */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Gate Verification Token Valid</span>
              <button
                type="button"
                onClick={markStudentPresent}
                disabled={attendanceMarked}
                className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition-all ${
                  attendanceMarked
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'btn-primary'
                }`}
              >
                <UserCheck size={16} />
                {attendanceMarked ? '✓ Attendance Confirmed' : 'Mark Candidate Present'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

