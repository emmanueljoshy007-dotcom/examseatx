import api from './axios'

/**
 * Dashboard API - Summary stats for the overview page
 */
export const dashboardApi = {
  // GET /api/dashboard/stats
  // Returns: { totalStudents, totalClassrooms, totalExams, upcomingExams, totalCapacity, ... }
  getStats: () => api.get('/dashboard/stats'),
}
