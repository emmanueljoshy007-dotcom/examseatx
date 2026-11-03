import api from './axios'

/**
 * Students API - All calls related to student management
 */
export const studentsApi = {
  // GET /api/students
  getAll: () => api.get('/students'),

  // GET /api/students/:id
  getById: (id) => api.get(`/students/${id}`),

  // GET /api/students/roll/:rollNumber
  getByRollNumber: (rollNumber) => api.get(`/students/roll/${rollNumber}`),

  // POST /api/students
  create: (studentData) => api.post('/students', studentData),

  // PUT /api/students/:id
  update: (id, studentData) => api.put(`/students/${id}`, studentData),

  // DELETE /api/students/:id
  delete: (id) => api.delete(`/students/${id}`),

  // POST /api/students/upload-csv (multipart/form-data)
  uploadCsv: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/students/upload-csv', formData, {
      headers: { 'Content-Type': undefined },
    })
  },

  // GET /api/students/stats
  getStats: () => api.get('/students/stats'),

  // GET /api/seating/lookup/:rollNumber
  lookupSeat: (rollNumber) => api.get(`/seating/lookup/${rollNumber}`),
}
