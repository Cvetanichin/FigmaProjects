import { useState } from 'react'
import { Link } from 'react-router'
import { Bot } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setUnconfirmedEmail(null)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Account created. Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setUnconfirmedEmail(email)
          }
          throw error
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: unconfirmedEmail })
      if (error) throw error
      toast.success('Confirmation email sent')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend confirmation email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-none">Intelligence Workspace</h1>
            <p className="text-xs text-muted-foreground">CSO Project Management</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mb-6 px-2">
          AI-enhanced CSO Project Management Software — Project Planning, Progress &amp; Risk Tracking, Budget
          Planning, and Donor-Compliant Reporting.{' '}
          <Link to="/about" className="text-primary hover:underline">Learn more</Link>
        </p>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-medium text-foreground mb-1">
            {isSignUp ? 'Create account' : 'Sign in'}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {isSignUp ? 'Set up your workspace account' : 'Access your project workspace'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@organisation.org"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-foreground">Password</label>
                {!isSignUp && (
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {unconfirmedEmail && (
              <div className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-md p-2.5">
                Your email isn't confirmed yet.{' '}
                <button type="button" onClick={handleResendConfirmation} className="underline hover:no-underline">
                  Resend confirmation email
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-foreground hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 text-xs text-muted-foreground">
          <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <span>·</span>
          <Link to="/legal/refunds" className="hover:text-foreground transition-colors">Refunds</Link>
          <span>·</span>
          <a href="mailto:cvetanichin@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </div>
  )
}
