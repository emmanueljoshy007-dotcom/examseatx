import api from './axios'

export const studentsApi = {
  // Query student seat allocation with room, row, col, and scannable QR code
  lookupSeat: (rollNumber) => api.get(`/seating/lookup/${rollNumber}`),
  
  // Basic student profile info
  getByRollNumber: (rollNumber) => api.get(`/students/roll/${rollNumber}`),
}

