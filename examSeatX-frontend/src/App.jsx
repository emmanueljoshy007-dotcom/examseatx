import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import ClassroomsPage from './pages/ClassroomsPage'
import ExamsPage from './pages/ExamsPage'
import StudentLookupPage from './pages/StudentLookupPage'
import DigitalNoticeBoardPage from './pages/DigitalNoticeBoardPage'
import QrScannerPage from './pages/QrScannerPage'
import Layout from './components/Layout'

/**
 * App.jsx - Root routing component
 *
 * Routes:
 *   /              -> Admin Dashboard (stats overview)
 *   /students      -> Student management + CSV upload
 *   /classrooms    -> Classroom configuration
 *   /exams         -> Exam management + seating engine trigger
 *   /scanner       -> Faculty gate QR verification scanner
 *   /lookup        -> Public student seat lookup (mobile-friendly)
 *   /notice-board  -> Kiosk display for lobby monitors & digital notices
 */
function App() {
  return (
    <Routes>
      {/* Admin routes — wrapped in Layout (sidebar + header) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="scanner" element={<QrScannerPage />} />
      </Route>

      {/* Standalone kiosk / student routes */}
      <Route path="/lookup" element={<StudentLookupPage />} />
      <Route path="/notice-board" element={<DigitalNoticeBoardPage />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
