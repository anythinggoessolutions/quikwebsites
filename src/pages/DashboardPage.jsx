import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/useAuth.jsx'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STATUS_LABELS = {
  draft: { text: 'Draft', color: '#FFD60A' },
  published: { text: 'Live', color: '#00C65A' },
  unpublished: { text: 'Offline', color: '#94a3b8' },
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const checkoutSuccess = searchParams.get('checkout') === 'success'
  const [credits, setCredits] = useState(null)
  const [sites, setSites] = useState(null) // null = loading, [] = none
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/auth', { replace: true })
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return

    fetch(`${API_URL}/api/credits?userId=${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setCredits)
      .catch(() => {})

    supabase
      .from('sites')
      .select('id, name, business_type, status, slug, cloudflare_deployment_url, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load sites:', error.message)
          setSites([])
        } else {
          setSites(data || [])
        }
      })
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-loading">
          <div className="dash-spinner" />
        </div>
        <DashStyles />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="dash-page">
      <nav className="dash-nav">
        <Link to="/" className="dash-nav-logo">
          <img src="/logo.webp" alt="QuikWebsites" className="dash-logo-img" />
        </Link>
        <div className="dash-nav-right">
          <span className="dash-nav-email">{user.email}</span>
          <button
            className="dash-nav-logout"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out...' : 'Log Out'}
          </button>
        </div>
      </nav>

      <div className="dash-content">
        {checkoutSuccess && (
          <div className="dash-banner-success">
            🎉 Payment successful! Your plan is active — you're ready to go live.
          </div>
        )}

        {credits && credits.plan === 'free' && (
          <div className="dash-banner-upgrade">
            <span>
              You're on the free plan. Pick a plan to publish your site, make
              edits, and connect a domain.
            </span>
            <button onClick={() => navigate('/pricing')}>Go Live →</button>
          </div>
        )}

        <div className="dash-header">
          <h1>Dashboard</h1>
          <motion.button
            className="dash-generate-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
          >
            + Build New Website
          </motion.button>
        </div>

        {/* Credits overview */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <span className="dash-stat-label">Total Credits</span>
            <span className="dash-stat-value">
              {credits ? credits.totalCredits : '--'}
            </span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-label">Monthly Credits</span>
            <span className="dash-stat-value">
              {credits ? credits.monthlyCredits : '--'}
            </span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-label">Purchased Credits</span>
            <span className="dash-stat-value">
              {credits ? credits.purchasedCredits : '--'}
            </span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-label">Plan</span>
            <span className="dash-stat-value dash-stat-plan">
              {credits ? credits.plan || 'Free' : '--'}
            </span>
          </div>
        </div>

        {/* Sites list */}
        <div className="dash-section">
          <h2>Your Websites</h2>

          {sites === null && (
            <div className="dash-sites-loading">
              <div className="dash-spinner" />
            </div>
          )}

          {sites && sites.length === 0 && (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <p>No websites yet</p>
              <span>Build your first website to see it here</span>
            </div>
          )}

          {sites && sites.length > 0 && (
            <div className="dash-sites-grid">
              {sites.map((site) => {
                const status = STATUS_LABELS[site.status] || STATUS_LABELS.draft
                return (
                  <motion.div
                    key={site.id}
                    className="dash-site-card"
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(`/sites/${site.id}`)}
                  >
                    <div className="dash-site-top">
                      <div className="dash-site-thumb">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M2 8h20" />
                          <circle cx="5" cy="5.5" r="0.5" fill="rgba(255,255,255,0.35)" />
                        </svg>
                      </div>
                      <span
                        className="dash-site-status"
                        style={{ color: status.color, borderColor: `${status.color}44`, background: `${status.color}11` }}
                      >
                        {status.text}
                      </span>
                    </div>
                    <h3 className="dash-site-name">{site.name}</h3>
                    <p className="dash-site-meta">
                      {site.business_type || 'Website'} · {new Date(site.created_at).toLocaleDateString()}
                    </p>
                    {site.status === 'published' && site.slug && (
                      <a
                        className="dash-site-url"
                        href={`https://${site.slug}.quikwebsites.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {site.slug}.quikwebsites.com ↗
                      </a>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <DashStyles />
    </div>
  )
}

function DashStyles() {
  return (
    <style>{`
      .dash-page {
        min-height: 100vh;
        background: #07051a;
        color: #fff;
      }

      /* Loading */
      .dash-loading {
        display: flex; align-items: center; justify-content: center;
        min-height: 100vh;
      }
      .dash-spinner {
        width: 32px; height: 32px;
        border: 3px solid rgba(255,255,255,0.1);
        border-top-color: #5b50e8;
        border-radius: 50%;
        animation: dashSpin 0.8s linear infinite;
      }
      @keyframes dashSpin { to { transform: rotate(360deg); } }

      /* Nav */
      .dash-nav {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 32px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .dash-nav-logo { display: inline-flex; align-items: center; text-decoration: none; }
      .dash-logo-img {
        height: 120px; width: auto;
        filter: brightness(0) invert(1);
        margin: -36px -20px;
      }
      .dash-nav-right {
        display: flex; align-items: center; gap: 16px;
      }
      .dash-nav-email {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: rgba(255,255,255,0.5);
      }
      .dash-nav-logout {
        font-family: 'Inter', sans-serif;
        font-size: 13px; font-weight: 500;
        color: rgba(255,255,255,0.5);
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .dash-nav-logout:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }

      /* Content */
      .dash-content {
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 32px;
      }
      .dash-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 32px;
      }
      .dash-header h1 {
        font-family: 'Sora', 'Inter', sans-serif;
        font-size: 32px; font-weight: 700;
        letter-spacing: -0.5px;
        margin: 0;
      }
      .dash-generate-btn {
        font-family: 'Inter', sans-serif;
        font-size: 14px; font-weight: 600;
        color: #fff;
        background: linear-gradient(135deg, #5b50e8, #7c6af5);
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(91,80,232,0.3);
      }

      /* Stats */
      .dash-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 40px;
      }
      .dash-stat-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 20px 24px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .dash-stat-label {
        font-family: 'Inter', sans-serif;
        font-size: 12px; font-weight: 500;
        color: rgba(255,255,255,0.4);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .dash-stat-value {
        font-family: 'Sora', 'Inter', sans-serif;
        font-size: 28px; font-weight: 700;
        color: #fff;
      }
      .dash-stat-plan { text-transform: capitalize; }

      /* Sections */
      .dash-section h2 {
        font-family: 'Sora', 'Inter', sans-serif;
        font-size: 20px; font-weight: 600;
        margin: 0 0 20px;
        letter-spacing: -0.3px;
      }

      /* Banners */
      .dash-banner-success {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: #00C65A;
        background: rgba(0,198,90,0.08);
        border: 1px solid rgba(0,198,90,0.25);
        border-radius: 12px;
        padding: 14px 20px;
        margin-bottom: 24px;
      }
      .dash-banner-upgrade {
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px; flex-wrap: wrap;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: rgba(255,255,255,0.75);
        background: rgba(91,80,232,0.1);
        border: 1px solid rgba(91,80,232,0.3);
        border-radius: 12px;
        padding: 14px 20px;
        margin-bottom: 24px;
      }
      .dash-banner-upgrade button {
        font-family: 'Inter', sans-serif;
        font-size: 13px; font-weight: 700;
        color: #fff;
        background: linear-gradient(135deg, #5b50e8, #7c6af5);
        border: none;
        border-radius: 10px;
        padding: 10px 20px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(91,80,232,0.35);
        flex-shrink: 0;
      }

      /* Sites grid */
      .dash-sites-loading {
        display: flex; justify-content: center;
        padding: 48px 0;
      }
      .dash-sites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
      }
      .dash-site-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 20px;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        display: flex; flex-direction: column; gap: 10px;
      }
      .dash-site-card:hover {
        border-color: rgba(91,80,232,0.4);
        background: rgba(255,255,255,0.06);
      }
      .dash-site-top {
        display: flex; align-items: center; justify-content: space-between;
      }
      .dash-site-thumb {
        width: 44px; height: 44px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
      }
      .dash-site-status {
        font-family: 'Inter', sans-serif;
        font-size: 11px; font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 4px 10px;
        border-radius: 50px;
        border: 1px solid;
      }
      .dash-site-name {
        font-family: 'Sora', 'Inter', sans-serif;
        font-size: 17px; font-weight: 600;
        margin: 0;
        letter-spacing: -0.2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dash-site-meta {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: rgba(255,255,255,0.35);
        margin: 0;
        text-transform: capitalize;
      }
      .dash-site-url {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: #00C65A;
        text-decoration: none;
      }
      .dash-site-url:hover { text-decoration: underline; }

      /* Empty state */
      .dash-empty {
        display: flex; flex-direction: column; align-items: center;
        padding: 60px 20px;
        background: rgba(255,255,255,0.02);
        border: 1px dashed rgba(255,255,255,0.08);
        border-radius: 16px;
        text-align: center;
      }
      .dash-empty-icon { margin-bottom: 16px; }
      .dash-empty p {
        font-family: 'Inter', sans-serif;
        font-size: 16px; font-weight: 500;
        color: rgba(255,255,255,0.5);
        margin: 0 0 4px;
      }
      .dash-empty span {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: rgba(255,255,255,0.25);
      }

      /* Responsive */
      @media (max-width: 640px) {
        .dash-nav { padding: 12px 16px; }
        .dash-content { padding: 24px 16px; }
        .dash-header {
          flex-direction: column; align-items: flex-start; gap: 16px;
        }
        .dash-nav-email { display: none; }
        .dash-stats { grid-template-columns: 1fr 1fr; }
      }
    `}</style>
  )
}
