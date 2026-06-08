import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { Toaster } from 'sonner'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
