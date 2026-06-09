import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/layout/AppLayout'
import { Login } from '../pages/Login'
import { Dashboard } from '../pages/Dashboard'
import { Projects } from '../pages/Projects'
import { ProjectDetail } from '../pages/ProjectDetail'
import { Indicators } from '../pages/Indicators'
import { Risks } from '../pages/Risks'
import { Activities } from '../pages/Activities'
import { Documents } from '../pages/Documents'
import { AIAgents } from '../pages/AIAgents'
import { Outputs } from '../pages/Outputs'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />}>
          <Route index element={null} />
          <Route path="activities" element={<Activities />} />
          <Route path="indicators" element={<Indicators />} />
          <Route path="risks" element={<Risks />} />
          <Route path="documents" element={<Documents />} />
          <Route path="agents" element={<AIAgents />} />
          <Route path="outputs" element={<Outputs />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <SpeedInsights />
      </BrowserRouter>
    </AuthProvider>
  )
}
