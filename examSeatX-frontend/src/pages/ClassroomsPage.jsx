import { useState, useEffect } from 'react'
import { Plus, Building2, Trash2, ToggleLeft, ToggleRight, Grid } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { classroomsApi } from '../api/classrooms'

/**
 * ClassroomsPage - Configure examination halls
 *
 * Features:
 * 1. View all classrooms with capacity info
 * 2. Add classroom with grid dimensions
 * 3. Toggle availability
 * 4. Delete classroom
 *
 * The grid model (rows x columns) is used by the CSP seating engine.
 */
function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    roomNumber: '',
    building: '',
    floor: 0,
    rows: '',
    columns: '',
    notes: '',
  })

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    try {
      setLoading(true)
      const response = await classroomsApi.getAll()
      setClassrooms(response.data)
    } catch (err) {
      toast.error('Failed to load classrooms')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const rows = parseInt(formData.rows)
    const columns = parseInt(formData.columns)
    try {
      await classroomsApi.create({
        ...formData,
        floor: parseInt(formData.floor),
        rows,
        columns,
        capacity: rows * columns,
      })
      toast.success(`Classroom ${formData.roomNumber} added!`)
      setShowForm(false)
      setFormData({ roomNumber: '', building: '', floor: 0, rows: '', columns: '', notes: '' })
      fetchClassrooms()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add classroom')
    }
  }

  const handleToggle = async (id, roomNumber, currentStatus) => {
    try {
      await classroomsApi.toggleAvailability(id)
      toast.success(`${roomNumber} marked as ${currentStatus ? 'unavailable' : 'available'}`)
      fetchClassrooms()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id, roomNumber) => {
    if (!confirm(`Delete classroom ${roomNumber}?`)) return
    try {
      await classroomsApi.delete(id)
      toast.success(`${roomNumber} deleted`)
      setClassrooms(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      toast.error('Failed to delete classroom')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading classrooms..." />
      </div>
    )
  }

  const totalCapacity = classrooms.reduce((sum, c) => sum + (c.available ? c.capacity : 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Classrooms</h1>
          <p className="text-slate-400 mt-1">
            {classrooms.length} rooms — {totalCapacity} available seats total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Classroom
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card animate-slide-up">
          <h3 className="text-slate-200 font-semibold mb-4">Add New Classroom</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Room Number *</label>
              <input
                required
                placeholder="e.g., EH-101"
                className="input-field"
                value={formData.roomNumber}
                onChange={e => setFormData(p => ({ ...p, roomNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Building</label>
              <input
                placeholder="e.g., Main Block"
                className="input-field"
                value={formData.building}
                onChange={e => setFormData(p => ({ ...p, building: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Floor</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.floor}
                onChange={e => setFormData(p => ({ ...p, floor: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Rows *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g., 10"
                className="input-field"
                value={formData.rows}
                onChange={e => setFormData(p => ({ ...p, rows: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Columns *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g., 8"
                className="input-field"
                value={formData.columns}
                onChange={e => setFormData(p => ({ ...p, columns: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Capacity (preview)</label>
              <div className="input-field bg-slate-800 cursor-default">
                {formData.rows && formData.columns
                  ? `${parseInt(formData.rows) * parseInt(formData.columns)} seats`
                  : '—'}
              </div>
            </div>
            <div className="col-span-3">
              <label className="block text-slate-400 text-sm mb-1">Notes</label>
              <input
                placeholder="Optional notes..."
                className="input-field"
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div className="col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">Add Classroom</button>
            </div>
          </form>
        </div>
      )}

      {/* Classroom Cards */}
      {classrooms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No classrooms configured"
          description="Add examination halls and labs to get started."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Classroom
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classrooms.map((room) => (
            <div
              key={room.id}
              className={`card border ${room.available ? 'border-slate-700' : 'border-red-800/50 opacity-70'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-slate-100 font-bold text-lg">{room.roomNumber}</h3>
                  <p className="text-slate-400 text-sm">{room.building} — Floor {room.floor}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  room.available
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {room.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {/* Grid Visualization Info */}
              <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2 mb-3">
                <Grid size={16} className="text-primary-400" />
                <span className="text-slate-300 text-sm font-mono">
                  {room.rows} rows x {room.columns} cols = {room.capacity} seats
                </span>
              </div>

              {room.notes && (
                <p className="text-slate-500 text-xs mb-3 italic">{room.notes}</p>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <button
                  onClick={() => handleToggle(room.id, room.roomNumber, room.available)}
                  className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {room.available ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                  {room.available ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(room.id, room.roomNumber)}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClassroomsPage
