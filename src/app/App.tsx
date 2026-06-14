import { Component, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-destructive/50 rounded-xl p-6">
            <h1 className="text-base font-semibold text-destructive mb-2">Application Error</h1>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(this.state.error as Error).message}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
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
import { CivilSocietyOS } from '../pages/CivilSocietyOS'

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
        <Route path="civil-society" element={<CivilSocietyOS />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
