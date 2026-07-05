import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { PLAN_LIMITS, type Plan } from '../lib/paddle'

interface Profile {
  plan: Plan
  ai_runs_used: number
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  profile: Profile
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  canRunAgent: () => boolean
  canAddProject: (currentCount: number) => boolean
}

const DEFAULT_PROFILE: Profile = { plan: 'free', ai_runs_used: 0 }

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  profile: DEFAULT_PROFILE,
  signOut: async () => {},
  refreshProfile: async () => {},
  canRunAgent: () => true,
  canAddProject: () => true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('plan, ai_runs_used').eq('id', userId).single()
    if (data) setProfile({ plan: (data.plan as Plan) ?? 'free', ai_runs_used: data.ai_runs_used ?? 0 })
  }

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(DEFAULT_PROFILE)
    })

    return () => subscription.unsubscribe()
  }, [])

  const canRunAgent = () => profile.ai_runs_used < PLAN_LIMITS[profile.plan].aiRuns
  const canAddProject = (currentCount: number) => currentCount < PLAN_LIMITS[profile.plan].projects

  const signOut = async () => { await supabase.auth.signOut() }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, profile, signOut, refreshProfile, canRunAgent, canAddProject }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
