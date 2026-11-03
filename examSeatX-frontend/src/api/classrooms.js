import api from './axios'

/**
 * Classrooms API - All calls related to classroom management
 */
export const classroomsApi = {
  // GET /api/classrooms
  getAll: () => api.get('/classrooms'),

  // GET /api/classrooms/:id
  getById: (id) => api.get(`/classrooms/${id}`),

  // POST /api/classrooms
  create: (classroomData) => api.post('/classrooms', classroomData),

  // PUT /api/classrooms/:id
  update: (id, classroomData) => api.put(`/classrooms/${id}`, classroomData),

  // DELETE /api/classrooms/:id
  delete: (id) => api.delete(`/classrooms/${id}`),

  // PATCH /api/classrooms/:id/toggle-availability
  toggleAvailability: (id) => api.patch(`/classrooms/${id}/toggle-availability`),
}
