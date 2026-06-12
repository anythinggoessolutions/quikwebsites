import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/useAuth.jsx'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') || 'login'
  const [mode, setMode] = useState(initialMode) // login | signup | forgot | reset-sent | verify
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, signIn, signUp, resetPassword } = useAuth()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password.'
        : error.message)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const { error } = await signUp(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message)
    } else {
      setMode('verify')
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Enter your email address.')
      return
    }
    setSubmitting(true)
    const { error } = await resetPassword(email)
    setSubmitting(false)
    if (error) {
      setError(error.message)
    } else {
      setMode('reset-sent')
    }
  }

  const switchMode = (newMode) => {
    setError('')
    setPassword('')
    setConfirmPassword('')
    setMode(newMode)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
      </div>

      <nav className="auth-nav">
        <Link to="/" className="auth-nav-logo">
          <img src="/logo.webp" alt="QuikWebsites" className="auth-logo-img" />
        </Link>
      </nav>

      <div className="auth-center">
        <AnimatePresence mode="wait">
          {/* ═══ LOGIN ═══ */}
          {mode === 'login' && (
            <motion.div
              key="login"
              className="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Log in to manage your websites</p>

              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <motion.button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? 'Logging in...' : 'Log In'}
                </motion.button>
              </form>

              <button className="auth-link" onClick={() => switchMode('forgot')}>
                Forgot your password?
              </button>
              <div className="auth-divider" />
              <p className="auth-switch">
                Don't have an account?{' '}
                <button className="auth-link-inline" onClick={() => switchMode('signup')}>
                  Sign up free
                </button>
              </p>
            </motion.div>
          )}

          {/* ═══ SIGNUP ═══ */}
          {mode === 'signup' && (
            <motion.div
              key="signup"
              className="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">Build your first website in under a minute</p>

              <form onSubmit={handleSignup} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="signup-confirm">Confirm password</label>
                  <input
                    id="signup-confirm"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <motion.button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? 'Creating account...' : 'Create Account'}
                </motion.button>
              </form>

              <p className="auth-terms">
                By signing up you agree to our{' '}
                <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
              <div className="auth-divider" />
              <p className="auth-switch">
                Already have an account?{' '}
                <button className="auth-link-inline" onClick={() => switchMode('login')}>
                  Log in
                </button>
              </p>
            </motion.div>
          )}

          {/* ═══ FORGOT PASSWORD ═══ */}
          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              className="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="auth-title">Reset password</h1>
              <p className="auth-subtitle">Enter your email and we'll send a reset link</p>

              <form onSubmit={handleForgot} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <motion.button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>

              <div className="auth-divider" />
              <p className="auth-switch">
                <button className="auth-link-inline" onClick={() => switchMode('login')}>
                  Back to login
                </button>
              </p>
            </motion.div>
          )}

          {/* ═══ RESET SENT ═══ */}
          {mode === 'reset-sent' && (
            <motion.div
              key="reset-sent"
              className="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="auth-success-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00C65A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
              </div>
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle">
                We sent a password reset link to <strong>{email}</strong>.
                Click the link in the email to set a new password.
              </p>
              <div className="auth-divider" />
              <p className="auth-switch">
                <button className="auth-link-inline" onClick={() => switchMode('login')}>
                  Back to login
                </button>
              </p>
            </motion.div>
          )}

          {/* ═══ VERIFY EMAIL ═══ */}
          {mode === 'verify' && (
            <motion.div
              key="verify"
              className="auth-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="auth-success-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00C65A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
              </div>
              <h1 className="auth-title">Verify your email</h1>
              <p className="auth-subtitle">
                We sent a confirmation link to <strong>{email}</strong>.
                Click the link to activate your account, then come back here to log in.
              </p>
              <div className="auth-divider" />
              <p className="auth-switch">
                <button className="auth-link-inline" onClick={() => switchMode('login')}>
                  Back to login
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: #07051a;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Background */
        .auth-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .auth-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, black 20%, transparent 70%);
        }
        .auth-bg-orb {
          position: absolute; border-radius: 50%; filter: blur(140px); opacity: 0.25;
        }
        .auth-bg-orb-1 {
          width: 600px; height: 600px; background: #5b50e8;
          top: -10%; left: -10%;
        }
        .auth-bg-orb-2 {
          width: 500px; height: 500px; background: #00C65A;
          bottom: -15%; right: -10%;
        }

        /* Nav */
        .auth-nav {
          position: relative; z-index: 2;
          padding: 16px 28px;
        }
        .auth-nav-logo { display: inline-flex; align-items: center; text-decoration: none; }
        .auth-logo-img {
          height: 120px; width: auto;
          filter: brightness(0) invert(1);
          margin: -36px -20px;
        }

        /* Center card */
        .auth-center {
          position: relative; z-index: 2;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 24px 60px;
        }
        .auth-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Typography */
        .auth-title {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .auth-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .auth-subtitle strong { color: rgba(255,255,255,0.8); }

        /* Form */
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-field label {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
        }
        .auth-field input {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: #fff;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .auth-field input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-field input:focus {
          border-color: rgba(91,80,232,0.5);
          background: rgba(255,255,255,0.08);
        }

        /* Error */
        .auth-error {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #ef4444;
          margin: 0;
          padding: 10px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 8px;
        }

        /* Primary button */
        .auth-btn-primary {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          cursor: pointer;
          margin-top: 4px;
          box-shadow: 0 4px 20px rgba(91,80,232,0.3);
          transition: opacity 0.2s;
        }
        .auth-btn-primary:hover { opacity: 0.9; }
        .auth-btn-primary:disabled {
          opacity: 0.6; cursor: not-allowed;
        }

        /* Links */
        .auth-link {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          background: none; border: none;
          cursor: pointer; margin-top: 16px;
          text-align: center;
          transition: color 0.2s;
        }
        .auth-link:hover { color: rgba(255,255,255,0.7); }

        .auth-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 20px 0;
        }

        .auth-switch {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin: 0;
        }
        .auth-link-inline {
          background: none; border: none;
          color: #7c6af5;
          font-weight: 600;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          transition: color 0.2s;
        }
        .auth-link-inline:hover { color: #a59aff; }

        .auth-terms {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          text-align: center;
          margin: 12px 0 0;
          line-height: 1.5;
        }
        .auth-terms a { color: rgba(255,255,255,0.5); }
        .auth-terms a:hover { color: #fff; }

        /* Success icon */
        .auth-success-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        /* Responsive */
        @media (max-width: 520px) {
          .auth-card {
            padding: 32px 24px;
            border-radius: 16px;
          }
          .auth-title { font-size: 24px; }
          .auth-center { padding: 0 16px 40px; }
        }
      `}</style>
    </div>
  )
}
