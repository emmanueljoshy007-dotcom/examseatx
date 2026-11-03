import { useState } from 'react'
import { User, CheckCircle2, Monitor } from 'lucide-react'

/**
 * InteractiveDeskGrid - Module 9: User Feedback & Display Module
 *
 * Renders an interactive 2D floor plan of an examination hall with:
 * - Front Invigilator Podium / Blackboard
 * - Individual desks arranged by row and column
 * - Color-coded by department to visualize zero-adjacency interleaving
 * - Interactive seat inspector popup
 */
export default function InteractiveDeskGrid({ classroom, assignments = [] }) {
  const [selectedSeat, setSelectedSeat] = useState(null)

  const rows = classroom?.rows || 6
  const cols = classroom?.columns || 6

  // Build a lookup map of row-col to assignment
  const seatMap = new Map()
  assignments.forEach((a) => {
    const room = a.roomNumber || a.classroom?.roomNumber
    if (!classroom?.roomNumber || room === classroom?.roomNumber) {
      seatMap.set(`${a.row}-${a.col}`, a)
    }
  })

  // Department color palette
  const getDeptColor = (dept) => {
    if (!dept) return 'bg-slate-800 border-slate-700 text-slate-500'
    if (dept.toLowerCase().includes('computer')) return 'bg-blue-600/30 border-blue-500 text-blue-300 hover:bg-blue-600/40'
    if (dept.toLowerCase().includes('electron')) return 'bg-purple-600/30 border-purple-500 text-purple-300 hover:bg-purple-600/40'
    if (dept.toLowerCase().includes('mech')) return 'bg-emerald-600/30 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40'
    return 'bg-amber-600/30 border-amber-500 text-amber-300 hover:bg-amber-600/40'
  }

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
      {/* Hall Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Hall {classroom?.roomNumber || 'Overview'} Seating Layout
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {classroom?.building || 'Main Examination Block'} • {rows} Rows × {cols} Columns ({classroom?.capacity || rows * cols} Desks)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 border border-blue-400" />
            <span className="text-slate-300">Computer Science</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500 border border-purple-400" />
            <span className="text-slate-300">Electronics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span className="text-slate-500">Empty / Buffer</span>
          </div>
        </div>
      </div>

      {/* Front Podium / Blackboard */}
      <div className="my-6 flex justify-center">
        <div className="w-3/4 max-w-md bg-slate-800/80 border border-slate-700 py-1.5 px-6 rounded-lg text-center shadow-inner">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-center gap-2">
            <Monitor size={14} className="text-primary-400" /> Front / Invigilator Podium & Board
          </p>
        </div>
      </div>

      {/* 2D Desk Grid */}
      <div className="overflow-x-auto pb-4">
        <div
          className="grid gap-3 mx-auto justify-center"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(70px, 1fr))`,
            minWidth: `${cols * 75}px`,
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const assignment = seatMap.get(`${r}-${c}`)
              const isAssigned = !!assignment
              const dept = assignment?.department || assignment?.student?.department
              const roll = assignment?.rollNumber || assignment?.student?.rollNumber
              const isSelected = selectedSeat?.id === assignment?.id

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => assignment && setSelectedSeat(assignment)}
                  className={`relative p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all duration-150 h-20 ${
                    isAssigned
                      ? `${getDeptColor(dept)} cursor-pointer ${
                          isSelected ? 'ring-2 ring-white scale-105 shadow-lg' : ''
                        }`
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-600 cursor-default'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    R{r + 1}-C{c + 1}
                  </span>

                  {isAssigned ? (
                    <>
                      <User size={15} className="my-0.5" />
                      <p className="font-mono text-[11px] font-bold text-white truncate w-full">
                        {roll}
                      </p>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">Vacant</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Selected Desk Details Drawer */}
      {selectedSeat && (
        <div className="mt-6 p-4 bg-slate-900 border border-primary-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold">
              {selectedSeat.seatLabel}
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">
                {selectedSeat.studentName || `${selectedSeat.student?.firstName} ${selectedSeat.student?.lastName}`}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Roll: <span className="text-primary-300 font-semibold">{selectedSeat.rollNumber || selectedSeat.student?.rollNumber}</span> • {selectedSeat.department || selectedSeat.student?.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-success text-xs flex items-center gap-1">
              <CheckCircle2 size={12} /> Conflict Free
            </span>
            <button
              onClick={() => setSelectedSeat(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
