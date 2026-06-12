import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/useAuth.jsx'
import { supabase } from '../lib/supabase'

const STATUS_LABELS = {
  draft: { text: 'Draft', color: '#FFD60A' },
  published: { text: 'Live', color: '#00C65A' },
  unpublished: { text: 'Offline', color: '#94a3b8' },
}

export default function SiteViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [site, setSite] = useState(null)
  const [error, setError] = useState('')
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('sites')
      .select('id, name, business_type, status, slug, html_content, created_at')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Site not found')
        } else {
          setSite(data)
        }
      })
  }, [user, id])

  // Render the site HTML into the iframe
  useEffect(() => {
    if (!site?.html_content || !iframeRef.current) return
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(site.html_content)
    doc.close()
  }, [site])

  const status = site ? (STATUS_LABELS[site.status] || STATUS_LABELS.draft) : null

  return (
    <div className="sv-page">
      <div className="sv-toolbar">
        <button className="sv-back" onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
        <div className="sv-center">
          {site && (
            <>
              <span className="sv-name">{site.name}</span>
              <span
                className="sv-status"
                style={{ color: status.color, borderColor: `${status.color}44`, background: `${status.color}11` }}
              >
                {status.text}
              </span>
            </>
          )}
        </div>
        <div className="sv-actions">
          {site && (
            <motion.button
              className="sv-edit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/sites/${id}/edit`)}
            >
              ✎ Edit Site
            </motion.button>
          )}
          {site && site.status === 'published' && site.slug && (
            <a
              className="sv-visit"
              href={`https://${site.slug}.quikwebsites.com`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Site ↗
            </a>
          )}
          {site && site.status !== 'published' && (
            <motion.button
              className="sv-cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/pricing?ready=1')}
            >
              Go Live →
            </motion.button>
          )}
        </div>
      </div>

      <div className="sv-frame-wrap">
        {error && (
          <div className="sv-message">
            <p>{error}</p>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        )}
        {!error && !site && (
          <div className="sv-message">
            <div className="sv-spinner" />
          </div>
        )}
        {site && (
          <iframe
            ref={iframeRef}
            className="sv-iframe"
            title={site.name}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>

      <style>{`
        .sv-page {
          position: fixed;
          inset: 0;
          background: #0a0a12;
          display: flex;
          flex-direction: column;
          z-index: 9999;
        }
        .sv-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #111119;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          gap: 16px;
        }
        .sv-back {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          background: none; border: none;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .sv-back:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .sv-center {
          display: flex; align-items: center; gap: 10px;
          overflow: hidden;
        }
        .sv-name {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sv-status {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 9px;
          border-radius: 50px;
          border: 1px solid;
          flex-shrink: 0;
        }
        .sv-actions { display: flex; gap: 8px; }
        .sv-edit {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #fff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .sv-edit:hover { background: rgba(255,255,255,0.14); }
        .sv-visit {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #00C65A;
          text-decoration: none;
          padding: 10px 16px;
          border: 1px solid rgba(0,198,90,0.3);
          border-radius: 10px;
          transition: background 0.2s;
        }
        .sv-visit:hover { background: rgba(0,198,90,0.1); }
        .sv-cta {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(91,80,232,0.4);
        }
        .sv-frame-wrap {
          flex: 1;
          position: relative;
          background: #fff;
        }
        .sv-iframe {
          width: 100%; height: 100%;
          border: none; display: block;
        }
        .sv-message {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px;
          background: #07051a;
        }
        .sv-message p {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }
        .sv-message button {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #fff;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 10px 24px;
          cursor: pointer;
        }
        .sv-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #5b50e8;
          border-radius: 50%;
          animation: svSpin 0.8s linear infinite;
        }
        @keyframes svSpin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .sv-toolbar { padding: 10px 12px; }
          .sv-name { max-width: 120px; }
          .sv-cta { font-size: 12px; padding: 8px 14px; }
        }
      `}</style>
    </div>
  )
}
