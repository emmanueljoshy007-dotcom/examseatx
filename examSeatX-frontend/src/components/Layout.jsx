import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

/**
 * Layout - The main admin shell
 *
 * Structure:
 * +----------+--------------------------+
 * |          |  Header                  |
 * | Sidebar  +--------------------------+
 * |          |  <Outlet /> (page)       |
 * +----------+--------------------------+
 *
 * <Outlet /> is where React Router renders the matched child route.
 */
function Layout() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar: fixed left navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
