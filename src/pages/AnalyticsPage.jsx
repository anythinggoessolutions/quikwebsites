import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth.jsx'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
]

/** Build a continuous day series ending today, filling gaps with 0. */
function buildSeries(dailyViews, days) {
  const series = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    series.push({
      key,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: dailyViews?.[key] || 0,
    })
  }
  return series
}

function BarChart({ series }) {
  const max = Math.max(1, ...series.map(s => s.count))
  const W = 800
  const H = 220
  const PAD = 4
  const barW = (W - PAD * 2) / series.length

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 24}`}
      className="an-chart"
      preserveAspectRatio="none"
      role="img"
      aria-label="Daily pageviews"
    >
      {series.map((s, i) => {
        const h = s.count === 0 ? 2 : Math.max(4, (s.count / max) * H)
        return (
          <g key={s.key}>
            <rect
              x={PAD + i * barW + barW * 0.15}
              y={H - h}
              width={barW * 0.7}
              height={h}
              rx={Math.min(4, barW * 0.2)}
              fill={s.count === 0 ? 'rgba(255,255,255,0.08)' : 'url(#anGrad)'}
            >
              <title>{`${s.label}: ${s.count} view${s.count === 1 ? '' : 's'}`}</title>
            </rect>
          </g>
        )
      })}
      {/* x-axis labels: first, middle, last */}
      {[0, Math.floor(series.length / 2), series.length - 1].map(i => (
        <text
          key={i}
          x={PAD + i * barW + barW / 2}
          y={H + 18}
          textAnchor="middle"
          className="an-chart-label"
        >
          {series[i]?.label}
        </text>
      ))}
      <defs>
        <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c6af5" />
          <stop offset="100%" stopColor="#5b50e8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function AnalyticsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [site, setSite] = useState(null)
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null) // { totalViews, dailyViews, topReferrers, topPages }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('sites')
      .select('id, name, status')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('Site not found')
        else setSite(data)
      })
  }, [user, id])

  useEffect(() => {
    if (!user || !id) return
    setLoading(true)
    fetch(`${API_URL}/api/analytics/summary?siteId=${id}&userId=${user.id}&days=${days}`)
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || 'Failed to load analytics')
        setData(d)
        setError('')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, id, days])

  const series = data ? buildSeries(data.dailyViews, days) : []
  const noTraffic = data && data.totalViews === 0

  return (
    <div className="an-page">
      <nav className="an-nav">
        <button className="an-back" onClick={() => navigate(`/sites/${id}`)}>
          ← Back to Site
        </button>
        <div className="an-nav-center">
          <span className="an-site-name">{site?.name || '...'}</span>
          <span className="an-badge">Analytics</span>
        </div>
        <div className="an-ranges">
          {RANGES.map(r => (
            <button
              key={r.days}
              className={days === r.days ? 'on' : ''}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="an-content">
        {error && (
          <div className="an-message">
            <p>{error}</p>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        )}

        {!error && loading && (
          <div className="an-message"><div className="an-spinner" /></div>
        )}

        {!error && !loading && data && (
          <>
            {/* Total */}
            <div className="an-total-row">
              <div className="an-total-card">
                <span className="an-total-label">Total visits — last {days} days</span>
                <span className="an-total-value">{data.totalViews.toLocaleString()}</span>
              </div>
              {site && site.status !== 'published' && (
                <div className="an-notice">
                  Your site isn't live yet — analytics start counting once it's
                  published.
                </div>
              )}
              {noTraffic && site?.status === 'published' && (
                <div className="an-notice">
                  No visits recorded yet. Share your site link to get traffic
                  flowing.
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="an-card">
              <h2>Daily visits</h2>
              <BarChart series={series} />
            </div>

            {/* Referrers + pages */}
            <div className="an-grid">
              <div className="an-card">
                <h2>Where visitors come from</h2>
                {data.topReferrers.length === 0 ? (
                  <p className="an-empty">
                    No referrer data yet — direct visits don't carry one.
                  </p>
                ) : (
                  <ul className="an-list">
                    {data.topReferrers.map(r => (
                      <li key={r.source}>
                        <span className="an-list-name">{r.source}</span>
                        <span className="an-list-count">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="an-card">
                <h2>Most viewed pages</h2>
                {data.topPages.length === 0 ? (
                  <p className="an-empty">No pageview data yet.</p>
                ) : (
                  <ul className="an-list">
                    {data.topPages.map(p => (
                      <li key={p.path}>
                        <span className="an-list-name">{p.path}</span>
                        <span className="an-list-count">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .an-page {
          min-height: 100vh;
          background: #07051a;
          color: #fff;
        }
        .an-nav {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .an-back {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          background: none; border: none;
          cursor: pointer; padding: 6px 12px;
          border-radius: 8px; transition: all 0.2s;
        }
        .an-back:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .an-nav-center { display: flex; align-items: center; gap: 10px; }
        .an-site-name {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
        }
        .an-badge {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: #00C65A;
          background: rgba(0,198,90,0.1);
          border: 1px solid rgba(0,198,90,0.3);
          padding: 3px 9px; border-radius: 50px;
        }
        .an-ranges { display: flex; gap: 6px; }
        .an-ranges button {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 7px 14px; cursor: pointer;
          transition: all 0.2s;
        }
        .an-ranges button.on {
          color: #fff;
          background: rgba(91,80,232,0.25);
          border-color: rgba(91,80,232,0.5);
        }

        .an-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 28px 24px 60px;
          display: flex; flex-direction: column; gap: 20px;
        }

        .an-total-row { display: flex; align-items: stretch; gap: 16px; flex-wrap: wrap; }
        .an-total-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 28px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .an-total-label {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: rgba(255,255,255,0.4);
        }
        .an-total-value {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 40px; font-weight: 800;
          letter-spacing: -1px;
        }
        .an-notice {
          flex: 1; min-width: 240px;
          display: flex; align-items: center;
          font-family: 'Inter', sans-serif;
          font-size: 13px; line-height: 1.5;
          color: rgba(255,255,255,0.55);
          background: rgba(255,214,10,0.06);
          border: 1px solid rgba(255,214,10,0.18);
          border-radius: 16px;
          padding: 16px 20px;
        }

        .an-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 24px;
        }
        .an-card h2 {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 15px; font-weight: 700;
          margin: 0 0 16px;
        }
        .an-chart { width: 100%; height: 240px; display: block; }
        .an-chart-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          fill: rgba(255,255,255,0.35);
        }

        .an-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .an-list { list-style: none; margin: 0; padding: 0; }
        .an-list li {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .an-list li:last-child { border-bottom: none; }
        .an-list-name {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.7);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .an-list-count {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #00C65A; flex-shrink: 0;
        }
        .an-empty {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.3);
          margin: 0;
        }

        .an-message {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; padding: 80px 0;
        }
        .an-message p {
          font-family: 'Inter', sans-serif;
          font-size: 15px; color: rgba(255,255,255,0.5); margin: 0;
        }
        .an-message button {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600; color: #fff;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px; padding: 10px 24px; cursor: pointer;
        }
        .an-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(255,255,255,0.12);
          border-top-color: #5b50e8;
          border-radius: 50%;
          animation: anSpin 0.8s linear infinite;
        }
        @keyframes anSpin { to { transform: rotate(360deg); } }

        @media (max-width: 720px) {
          .an-grid { grid-template-columns: 1fr; }
          .an-total-value { font-size: 32px; }
        }
      `}</style>
    </div>
  )
}
