import { useState, useEffect } from 'react'
import { Plus, Upload, Search, Trash2, Users, FileDown } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { studentsApi } from '../api/students'

/**
 * StudentsPage - Full CRUD interface for student management
 *
 * Features:
 * 1. View all students in a searchable table
 * 2. Add individual student via form
 * 3. Upload bulk students via CSV
 * 4. Delete students
 *
 * API: GET/POST/DELETE /api/students
 */
function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Form state for adding a new student
  const [formData, setFormData] = useState({
    rollNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    semester: '',
    academicYear: '2024-25',
    program: 'B.Tech',
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await studentsApi.getAll()
      setStudents(response.data)
    } catch (err) {
      toast.error('Failed to load students. Is the backend running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    try {
      await studentsApi.create({
        ...formData,
        semester: parseInt(formData.semester),
      })
      toast.success(`Student ${formData.firstName} ${formData.lastName} added!`)
      setShowAddForm(false)
      setFormData({
        rollNumber: '', firstName: '', lastName: '', email: '',
        department: '', semester: '', academicYear: '2024-25', program: 'B.Tech',
      })
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      await studentsApi.delete(id)
      toast.success(`${name} deleted`)
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      toast.error('Failed to delete student')
    }
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return
    try {
      setUploading(true)
      const response = await studentsApi.uploadCsv(csvFile)
      toast.success(response.data.message || `Successfully imported ${response.data.importedCount} students!`)
      setCsvFile(null)
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV upload failed. Please check the file format.')
    } finally {
      setUploading(false)
    }
  }

  const downloadSampleCsv = () => {
    const csvContent =
      "rollNumber,firstName,lastName,email,department,semester,academicYear,program\n" +
      "CS2024011,Dev,Patel,dev.patel@student.edu,Computer Science,5,2024-25,B.Tech\n" +
      "CS2024012,Riya,Shah,riya.shah@student.edu,Computer Science,5,2024-25,B.Tech\n" +
      "EC2024011,Karan,Verma,karan.verma@student.edu,Electronics,5,2024-25,B.Tech\n" +
      "EC2024012,Neha,Joshi,neha.joshi@student.edu,Electronics,5,2024-25,B.Tech\n"

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'students_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter students by search query
  const filteredStudents = students.filter(s =>
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading students..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Students</h1>
          <p className="text-slate-400 mt-1">{students.length} students registered</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Download Sample CSV */}
          <button
            onClick={downloadSampleCsv}
            className="btn-secondary flex items-center gap-2 text-xs"
            title="Download CSV format template"
          >
            <FileDown size={15} />
            Sample CSV Template
          </button>

          {/* CSV Upload */}
          <label className="btn-secondary cursor-pointer flex items-center gap-2 text-xs">
            <Upload size={15} />
            {csvFile ? `Selected: ${csvFile.name}` : 'Upload CSV'}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCsvFile(e.target.files[0])
                }
              }}
            />
          </label>
          {csvFile && (
            <button
              onClick={handleCsvUpload}
              disabled={uploading}
              className="btn-primary flex items-center gap-2 text-xs font-bold animate-pulse"
            >
              <Upload size={14} />
              {uploading ? 'Importing...' : 'Confirm Upload'}
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus size={15} />
            Add Student
          </button>
        </div>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <div className="card animate-slide-up">
          <h3 className="text-slate-200 font-semibold mb-4">Add New Student</h3>
          <form onSubmit={handleAddStudent} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Roll Number *</label>
              <input
                type="text"
                required
                placeholder="e.g., CS2022001"
                className="input-field"
                value={formData.rollNumber}
                onChange={e => setFormData(p => ({ ...p, rollNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Email</label>
              <input
                type="email"
                placeholder="student@example.edu"
                className="input-field"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="First name"
                className="input-field"
                value={formData.firstName}
                onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Last name"
                className="input-field"
                value={formData.lastName}
                onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Department *</label>
              <input
                type="text"
                required
                placeholder="e.g., Computer Science"
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
            <div className="col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by roll number, name, or department..."
          className="input-field pl-9"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={searchQuery ? 'Try a different search term.' : 'Add your first student or upload a CSV file.'}
          action={
            !searchQuery && (
              <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Add Student
              </button>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Roll #</th>
                <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Department</th>
                <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Semester</th>
                <th className="text-left text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Program</th>
                <th className="text-right text-slate-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                    index % 2 === 0 ? 'bg-slate-800/20' : ''
                  }`}
                >
                  <td className="px-6 py-3">
                    <span className="font-mono text-primary-400 text-sm">{student.rollNumber}</span>
                  </td>
                  <td className="px-6 py-3 text-slate-200 font-medium">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-3 text-slate-400 text-sm">{student.department}</td>
                  <td className="px-6 py-3 text-slate-400 text-sm">Sem {student.semester}</td>
                  <td className="px-6 py-3 text-slate-400 text-sm">{student.program}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StudentsPage
