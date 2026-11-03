import api from './axios'

/**
 * Exams API - All calls related to exam management and seating generation
 */
export const examsApi = {
  // GET /api/exams
  getAll: () => api.get('/exams'),

  // GET /api/exams/:id
  getById: (id) => api.get(`/exams/${id}`),

  // POST /api/exams
  create: (examData) => api.post('/exams', examData),

  // PUT /api/exams/:id
  update: (id, examData) => api.put(`/exams/${id}`, examData),

  // DELETE /api/exams/:id
  delete: (id) => api.delete(`/exams/${id}`),

  // POST /api/exams/:id/generate-seating
  // This triggers the CSP engine! May take a few seconds.
  generateSeating: (examId, options = {}) =>
    api.post(`/exams/${examId}/generate-seating`, options),

  // GET /api/exams/:id/seating-plan
  getSeatingPlan: (examId) => api.get(`/exams/${examId}/seating-plan`),

  // GET /api/exams/:id/seating-plan/pdf (returns blob)
  downloadPdf: (examId) =>
    api.get(`/exams/${examId}/seating-plan/pdf`, { responseType: 'blob' }),

  // POST /api/exams/:examId/students/:studentId
  enrollStudent: (examId, studentId) =>
    api.post(`/exams/${examId}/students/${studentId}`),

  // DELETE /api/exams/:examId/students/:studentId
  unenrollStudent: (examId, studentId) =>
    api.delete(`/exams/${examId}/students/${studentId}`),
}
