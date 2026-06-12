import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/useAuth.jsx'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Strip protocols, www, paths, trailing slashes — give backend a clean apex domain
function normalizeDomain(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

// Surface-level sanity check before round-tripping to the backend
function isLikelyDomain(d) {
  return /^([a-z0-9-]+\.)+[a-z]{2,}$/.test(d) && !d.endsWith('-') && !d.includes('..')
}

export default function DomainPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [site, setSite] = useState(null)
  const [siteError, setSiteError] = useState('')
  const [status, setStatus] = useState(null) // null = loading, object once fetched
  const [domainInput, setDomainInput] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectResult, setConnectResult] = useState(null) // { domain, nameservers, records }
  const [connectError, setConnectError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [copied, setCopied] = useState(null) // index of nameserver that was copied

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('sites')
      .select('id, name, status, slug, custom_domain, cloudflare_project_id')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setSiteError('Site not found')
        else setSite(data)
      })
  }, [user, id])

  const loadStatus = useCallback(() => {
    if (!user || !id) return Promise.resolve()
    return fetch(`${API_URL}/api/domains/status?siteId=${id}&userId=${user.id}`)
      .then(r => (r.ok ? r.json() : { connected: false }))
      .then(setStatus)
      .catch(() => setStatus({ connected: false }))
  }, [user, id])

  useEffect(() => { loadStatus() }, [loadStatus])

  // Poll for propagation while domain is connected but not yet active
  useEffect(() => {
    if (!status?.connected || status.active) return
    const interval = setInterval(loadStatus, 30_000)
    return () => clearInterval(interval)
  }, [status, loadStatus])

  const handleConnect = async (e) => {
    e.preventDefault()
    setConnectError('')
    const clean = normalizeDomain(domainInput)
    if (!isLikelyDomain(clean)) {
      setConnectError('That doesn\'t look like a valid domain. Try something like "yourbrand.com".')
      return
    }
    if (!site) return
    if (site.status !== 'published') {
      setConnectError('Publish your site first — custom domains only work on published sites.')
      return
    }
    setConnecting(true)
    try {
      const res = await fetch(`${API_URL}/api/domains/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: id, userId: user.id, domain: clean }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to connect domain')
      setConnectResult(data)
      setSite(s => ({ ...s, custom_domain: clean }))
      loadStatus()
    } catch (err) {
      setConnectError(err.message || 'Failed to connect domain')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (disconnecting) return
    const confirmed = window.confirm(
      'Disconnect this domain? Your site stays live at your QuikWebsites address, ' +
      'but visitors to your custom domain will stop reaching it.'
    )
    if (!confirmed) return
    setDisconnecting(true)
    try {
      const res = await fetch(`${API_URL}/api/domains/disconnect`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: id, userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to disconnect')
      setConnectResult(null)
      setStatus({ connected: false })
      setSite(s => ({ ...s, custom_domain: null }))
      setDomainInput('')
    } catch (err) {
      alert(err.message || 'Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStatus()
    setRefreshing(false)
  }

  const copyNameserver = (ns, i) => {
    navigator.clipboard?.writeText(ns).then(() => {
      setCopied(i)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  // Nameservers come from either the freshly-returned connect result or the status check
  const nameservers = connectResult?.nameservers || status?.nameservers || []
  const isActive = status?.active === true
  const isPending = status?.connected && !isActive
  const isUnconnected = !status?.connected && !connectResult

  return (
    <div className="dn-page">
      <nav className="dn-nav">
        <button className="dn-back" onClick={() => navigate(`/sites/${id}`)}>
          ← Back to Site
        </button>
        <div className="dn-nav-center">
          <span className="dn-site-name">{site?.name || '...'}</span>
          <span className="dn-badge">Domain</span>
        </div>
        <div className="dn-nav-right" />
      </nav>

      <div className="dn-content">
        {siteError && (
          <div className="dn-message">
            <p>{siteError}</p>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        )}

        {/* ── Site not published yet ── */}
        {site && site.status !== 'published' && (
          <div className="dn-card dn-card-warn">
            <h2>Publish your site first</h2>
            <p>
              Custom domains only work on published sites. Pick a plan to
              publish, and then you can point your domain to it.
            </p>
            <motion.button
              className="dn-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pricing?ready=1')}
            >
              Pick a plan →
            </motion.button>
          </div>
        )}

        {/* ── Active state ── */}
        {site && site.status === 'published' && isActive && (
          <motion.div
            className="dn-card dn-card-success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="dn-success-row">
              <div className="dn-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C65A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l2.5 2.5L16 9" />
                </svg>
              </div>
              <div>
                <h2>Your domain is live</h2>
                <p>
                  <strong>{status.domain}</strong> is connected and SSL is{' '}
                  {status.ssl === 'active' ? 'active' : 'being issued'}.
                </p>
              </div>
            </div>
            <div className="dn-actions">
              <a
                className="dn-btn-secondary"
                href={`https://${status.domain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit {status.domain} ↗
              </a>
              <button
                className="dn-btn-danger-text"
                disabled={disconnecting}
                onClick={handleDisconnect}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Pending propagation state ── */}
        {site && site.status === 'published' && isPending && (
          <motion.div
            className="dn-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="dn-pending-head">
              <div className="dn-pulse" />
              <div>
                <h2>Almost there — waiting on DNS</h2>
                <p>
                  We've set up <strong>{status.domain}</strong> on our end.
                  Now update your nameservers at your domain registrar.
                </p>
              </div>
            </div>

            <ol className="dn-steps">
              <li>
                <span className="dn-step-num">1</span>
                <div>
                  <strong>Log into your domain registrar</strong>
                  <p>Wherever you bought your domain — Namecheap, GoDaddy, Google Domains, etc.</p>
                </div>
              </li>
              <li>
                <span className="dn-step-num">2</span>
                <div>
                  <strong>Find "Nameservers" and replace them with these two:</strong>
                  <div className="dn-ns-list">
                    {nameservers.map((ns, i) => (
                      <div key={ns} className="dn-ns-row">
                        <code>{ns}</code>
                        <button
                          className="dn-copy-btn"
                          onClick={() => copyNameserver(ns, i)}
                        >
                          {copied === i ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <span className="dn-step-num">3</span>
                <div>
                  <strong>Save and wait</strong>
                  <p>
                    Most domains connect within an hour, but it can take up to
                    24 hours. We'll check automatically every 30 seconds.
                  </p>
                </div>
              </li>
            </ol>

            <div className="dn-actions">
              <button
                className="dn-btn-secondary"
                disabled={refreshing}
                onClick={handleRefresh}
              >
                {refreshing ? 'Checking…' : 'Check now'}
              </button>
              <button
                className="dn-btn-danger-text"
                disabled={disconnecting}
                onClick={handleDisconnect}
              >
                {disconnecting ? 'Disconnecting…' : 'Cancel & disconnect'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Unconnected: connect form ── */}
        {site && site.status === 'published' && isUnconnected && (
          <motion.div
            className="dn-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>Connect your own domain</h2>
            <p className="dn-lede">
              Point your domain at this site. Takes about 5 minutes to set up
              and 4–24 hours to fully propagate. SSL is automatic and free.
            </p>

            <form onSubmit={handleConnect} className="dn-form">
              <label htmlFor="dn-domain">Your domain</label>
              <input
                id="dn-domain"
                type="text"
                placeholder="yourbrand.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                autoComplete="off"
                autoFocus
                disabled={connecting}
              />
              <span className="dn-form-help">
                Just the domain — no "https://" or "www" in front.
              </span>

              {connectError && <p className="dn-error">{connectError}</p>}

              <motion.button
                type="submit"
                className="dn-btn-primary"
                whileHover={{ scale: connecting ? 1 : 1.02 }}
                whileTap={{ scale: connecting ? 1 : 0.98 }}
                disabled={connecting || !domainInput.trim()}
              >
                {connecting ? 'Setting up your domain…' : 'Connect Domain'}
              </motion.button>
            </form>

            <div className="dn-faq">
              <details>
                <summary>I don't own a domain yet</summary>
                <p>
                  Buy one from any registrar — we recommend Cloudflare or
                  Namecheap for the lowest prices. Once you own it, come back
                  here.
                </p>
              </details>
              <details>
                <summary>Will my email keep working?</summary>
                <p>
                  If your email is on Google Workspace, yes — we configure those
                  records automatically. For other providers, contact support
                  before connecting and we'll handle the MX records for you.
                </p>
              </details>
              <details>
                <summary>How long does it take?</summary>
                <p>
                  Most domains go live within an hour after you update your
                  nameservers. The maximum is 24–48 hours, but that's rare.
                </p>
              </details>
            </div>
          </motion.div>
        )}

        {/* Still loading status */}
        {site && site.status === 'published' && status === null && (
          <div className="dn-message"><div className="dn-spinner" /></div>
        )}
      </div>

      <style>{`
        .dn-page {
          min-height: 100vh;
          background: #07051a;
          color: #fff;
        }

        /* Nav */
        .dn-nav {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .dn-back {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          background: none; border: none;
          cursor: pointer; padding: 6px 12px;
          border-radius: 8px; transition: all 0.2s;
        }
        .dn-back:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .dn-nav-center { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .dn-site-name {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .dn-badge {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: #7c6af5;
          background: rgba(91,80,232,0.12);
          border: 1px solid rgba(91,80,232,0.35);
          padding: 3px 9px; border-radius: 50px;
        }
        .dn-nav-right { width: 60px; }

        /* Content */
        .dn-content {
          max-width: 720px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* Card */
        .dn-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 32px 28px;
        }
        .dn-card h2 {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 22px; font-weight: 700;
          letter-spacing: -0.3px;
          margin: 0 0 10px;
        }
        .dn-card p {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.55;
          margin: 0;
        }
        .dn-card p strong { color: #fff; }

        .dn-card-warn {
          background: rgba(255,214,10,0.06);
          border-color: rgba(255,214,10,0.25);
        }
        .dn-card-success {
          background: rgba(0,198,90,0.06);
          border-color: rgba(0,198,90,0.25);
        }

        .dn-lede {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          margin: 0 0 20px !important;
        }

        /* Success state */
        .dn-success-row {
          display: flex; align-items: flex-start; gap: 14px;
          margin-bottom: 20px;
        }
        .dn-success-icon { flex-shrink: 0; padding-top: 2px; }
        .dn-success-row h2 { margin-bottom: 6px; }

        /* Pending state */
        .dn-pending-head {
          display: flex; align-items: flex-start; gap: 14px;
          margin-bottom: 24px;
        }
        .dn-pulse {
          width: 14px; height: 14px;
          background: #FFD60A;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 8px;
          animation: dnPulse 1.8s ease-in-out infinite;
        }
        @keyframes dnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,214,10,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(255,214,10,0); }
        }
        .dn-pending-head h2 { margin-bottom: 6px; }

        /* Steps */
        .dn-steps {
          list-style: none;
          margin: 0 0 28px;
          padding: 0;
          display: flex; flex-direction: column;
          gap: 22px;
        }
        .dn-steps li {
          display: flex; gap: 14px;
        }
        .dn-step-num {
          flex-shrink: 0;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(91,80,232,0.18);
          border: 1px solid rgba(91,80,232,0.45);
          color: #b3aaff;
          font-family: 'Sora', 'Inter', sans-serif;
          font-weight: 700; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
        }
        .dn-steps strong {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff;
          display: block; margin-bottom: 4px;
        }
        .dn-steps p {
          font-size: 13px !important;
          color: rgba(255,255,255,0.5) !important;
          margin: 0 !important;
        }

        /* Nameserver list */
        .dn-ns-list {
          display: flex; flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }
        .dn-ns-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
        }
        .dn-ns-row code {
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
          font-size: 13px;
          color: #fff;
          background: none;
          word-break: break-all;
        }
        .dn-copy-btn {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 7px;
          padding: 6px 12px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .dn-copy-btn:hover {
          background: rgba(255,255,255,0.14);
          color: #fff;
        }

        /* Form */
        .dn-form {
          display: flex; flex-direction: column;
          gap: 6px;
          margin-bottom: 24px;
        }
        .dn-form label {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          margin-bottom: 2px;
        }
        .dn-form input {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #fff;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 14px 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        .dn-form input:focus { border-color: rgba(91,80,232,0.55); }
        .dn-form input::placeholder { color: rgba(255,255,255,0.25); }
        .dn-form input:disabled { opacity: 0.55; }
        .dn-form-help {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
        }

        /* Buttons */
        .dn-btn-primary {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(91,80,232,0.3);
          margin-top: 8px;
        }
        .dn-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .dn-btn-secondary {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 11px 20px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: background 0.2s;
        }
        .dn-btn-secondary:hover { background: rgba(255,255,255,0.13); }
        .dn-btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

        .dn-btn-danger-text {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(239,68,68,0.85);
          background: none; border: none;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .dn-btn-danger-text:hover {
          background: rgba(239,68,68,0.08);
          color: #ef4444;
        }
        .dn-btn-danger-text:disabled { opacity: 0.5; cursor: not-allowed; }

        .dn-actions {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
          margin-top: 8px;
        }

        .dn-error {
          font-family: 'Inter', sans-serif;
          font-size: 13px !important;
          color: #ef4444 !important;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 10px;
          padding: 10px 14px;
          margin: 8px 0 0 !important;
        }

        /* FAQ */
        .dn-faq {
          display: flex; flex-direction: column;
          gap: 4px;
          margin-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 20px;
        }
        .dn-faq details {
          border-radius: 8px;
        }
        .dn-faq summary {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          padding: 10px 0;
          cursor: pointer;
          list-style: none;
        }
        .dn-faq summary::-webkit-details-marker { display: none; }
        .dn-faq summary::before {
          content: '+';
          display: inline-block;
          width: 18px;
          font-weight: 400;
          color: rgba(255,255,255,0.3);
        }
        .dn-faq details[open] summary::before { content: '−'; }
        .dn-faq summary:hover { color: #fff; }
        .dn-faq details p {
          font-size: 13px !important;
          color: rgba(255,255,255,0.5) !important;
          padding: 0 0 12px 18px;
          margin: 0;
          line-height: 1.5;
        }

        /* Message / loading */
        .dn-message {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px;
          padding: 80px 0;
        }
        .dn-message p {
          font-family: 'Inter', sans-serif;
          font-size: 15px; color: rgba(255,255,255,0.5);
          margin: 0;
        }
        .dn-message button {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600; color: #fff;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px; padding: 10px 24px; cursor: pointer;
        }
        .dn-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(255,255,255,0.12);
          border-top-color: #5b50e8;
          border-radius: 50%;
          animation: dnSpin 0.8s linear infinite;
        }
        @keyframes dnSpin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .dn-content { padding: 24px 16px 60px; }
          .dn-card { padding: 24px 20px; border-radius: 16px; }
          .dn-card h2 { font-size: 19px; }
          .dn-ns-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .dn-actions { flex-direction: column; align-items: stretch; }
          .dn-actions .dn-btn-secondary { text-align: center; }
        }
      `}</style>
    </div>
  )
}
