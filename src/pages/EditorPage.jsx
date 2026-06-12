import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/useAuth.jsx'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const QUICK_IDEAS = [
  'Change the headline to be more attention-grabbing',
  'Make the color scheme warmer',
  'Rewrite the about section to sound more professional',
  'Add a customer testimonials section',
]

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [site, setSite] = useState(null)
  const [pageError, setPageError] = useState('')
  const [credits, setCredits] = useState(null)

  const [instruction, setInstruction] = useState('')
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState('')
  const [editLog, setEditLog] = useState([]) // { instruction, at }

  const [versions, setVersions] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [rollingBack, setRollingBack] = useState(null)

  const iframeRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true })
  }, [user, authLoading, navigate])

  const loadCredits = useCallback(() => {
    if (!user) return
    fetch(`${API_URL}/api/credits?userId=${user.id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(setCredits)
      .catch(() => {})
  }, [user])

  const loadVersions = useCallback(() => {
    if (!user || !id) return
    fetch(`${API_URL}/api/editor/versions?siteId=${id}&userId=${user.id}`)
      .then(r => (r.ok ? r.json() : { versions: [] }))
      .then(d => setVersions(d.versions || []))
      .catch(() => {})
  }, [user, id])

  // Load site, credits, versions
  useEffect(() => {
    if (!user || !id) return
    supabase
      .from('sites')
      .select('id, name, status, html_content')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setPageError('Site not found')
        else setSite(data)
      })
    loadCredits()
    loadVersions()
  }, [user, id, loadCredits, loadVersions])

  // Render HTML into iframe whenever it changes
  useEffect(() => {
    if (!site?.html_content || !iframeRef.current) return
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(site.html_content)
    doc.close()
  }, [site?.html_content])

  const totalCredits = credits ? credits.totalCredits : null
  const outOfCredits = totalCredits !== null && totalCredits < 1

  const applyEdit = async (text) => {
    const inst = (text || instruction).trim()
    if (!inst || editing) return
    setEditError('')
    setEditing(true)
    try {
      const res = await fetch(`${API_URL}/api/editor/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: id, userId: user.id, instruction: inst }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Edit failed')
      setSite(s => ({ ...s, html_content: data.html }))
      setEditLog(log => [{ instruction: inst, at: new Date() }, ...log])
      setInstruction('')
      loadCredits()
      loadVersions()
    } catch (err) {
      setEditError(err.message || 'Something went wrong')
    } finally {
      setEditing(false)
    }
  }

  const rollback = async (versionId) => {
    if (rollingBack) return
    setRollingBack(versionId)
    setEditError('')
    try {
      const res = await fetch(`${API_URL}/api/editor/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: id, userId: user.id, versionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Restore failed')
      setSite(s => ({ ...s, html_content: data.html }))
      loadVersions()
    } catch (err) {
      setEditError(err.message || 'Restore failed')
    } finally {
      setRollingBack(null)
    }
  }

  return (
    <div className="ed-page">
      {/* ── Toolbar ── */}
      <div className="ed-toolbar">
        <button className="ed-back" onClick={() => navigate(`/sites/${id}`)}>
          ← Back
        </button>
        <div className="ed-toolbar-center">
          <span className="ed-site-name">{site?.name || '...'}</span>
          <span className="ed-mode-badge">Editor</span>
        </div>
        <div className="ed-toolbar-right">
          {totalCredits !== null && (
            <span className="ed-credits" title="1 credit = 1 edit">
              ⚡ {totalCredits} {totalCredits === 1 ? 'edit' : 'edits'} left
            </span>
          )}
          <button
            className={`ed-history-btn ${showHistory ? 'on' : ''}`}
            onClick={() => setShowHistory(v => !v)}
          >
            History
          </button>
        </div>
      </div>

      <div className="ed-body">
        {/* ── Side panel ── */}
        <div className="ed-panel">
          <h2 className="ed-panel-title">Edit your website</h2>
          <p className="ed-panel-sub">
            Describe the change in plain English. Each edit uses 1 credit —
            undo is always free.
          </p>

          <textarea
            className="ed-input"
            placeholder='e.g. "Change the headline to Brooklyn&apos;s Best Pizza" or "Make the contact section blue"'
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            rows={4}
            disabled={editing || outOfCredits}
          />

          <motion.button
            className="ed-apply"
            whileHover={{ scale: editing ? 1 : 1.02 }}
            whileTap={{ scale: editing ? 1 : 0.98 }}
            disabled={editing || !instruction.trim() || outOfCredits}
            onClick={() => applyEdit()}
          >
            {editing ? 'Applying your edit…' : 'Apply Edit (1 credit)'}
          </motion.button>

          {editing && (
            <p className="ed-working">
              The AI is rewriting your site — this takes about 30 seconds.
            </p>
          )}

          {editError && <p className="ed-error">{editError}</p>}

          {outOfCredits && (
            <div className="ed-upsell">
              <p>You're out of edits.</p>
              <button onClick={() => navigate('/pricing')}>
                Get more edits →
              </button>
            </div>
          )}

          {/* Quick ideas */}
          {!outOfCredits && (
            <div className="ed-ideas">
              <span className="ed-ideas-label">Try one of these</span>
              {QUICK_IDEAS.map(idea => (
                <button
                  key={idea}
                  className="ed-idea"
                  disabled={editing}
                  onClick={() => setInstruction(idea)}
                >
                  {idea}
                </button>
              ))}
            </div>
          )}

          {/* This session's edits */}
          {editLog.length > 0 && (
            <div className="ed-log">
              <span className="ed-ideas-label">Applied this session</span>
              {editLog.map((e, i) => (
                <div key={i} className="ed-log-item">
                  <span className="ed-log-check">✓</span>
                  {e.instruction}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Preview ── */}
        <div className="ed-preview">
          {pageError && (
            <div className="ed-message">
              <p>{pageError}</p>
              <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
          )}
          {!pageError && !site && (
            <div className="ed-message"><div className="ed-spinner" /></div>
          )}
          {site && (
            <>
              <iframe
                ref={iframeRef}
                className="ed-iframe"
                title={site.name}
                sandbox="allow-scripts allow-same-origin"
              />
              {editing && (
                <div className="ed-overlay">
                  <div className="ed-spinner" />
                  <p>Applying your edit…</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── History drawer ── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              className="ed-history"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="ed-history-head">
                <h3>Version history</h3>
                <button onClick={() => setShowHistory(false)}>✕</button>
              </div>
              <p className="ed-history-sub">
                Every edit saves a backup. Restoring is free.
              </p>
              {versions.length === 0 && (
                <p className="ed-history-empty">
                  No versions yet — they'll appear after your first edit.
                </p>
              )}
              {versions.map((v, i) => (
                <div key={v.id} className="ed-version">
                  <div>
                    <span className="ed-version-label">
                      {i === 0 ? 'Latest backup' : `Backup ${versions.length - i}`}
                    </span>
                    <span className="ed-version-date">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    disabled={rollingBack !== null}
                    onClick={() => rollback(v.id)}
                  >
                    {rollingBack === v.id ? '...' : 'Restore'}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .ed-page {
          position: fixed; inset: 0;
          background: #0a0a12;
          display: flex; flex-direction: column;
          z-index: 9999;
        }

        /* Toolbar */
        .ed-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px;
          background: #111119;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0; gap: 16px;
        }
        .ed-back {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          background: none; border: none;
          cursor: pointer; padding: 6px 12px;
          border-radius: 8px; transition: all 0.2s;
        }
        .ed-back:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .ed-toolbar-center { display: flex; align-items: center; gap: 10px; overflow: hidden; }
        .ed-site-name {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ed-mode-badge {
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: #7c6af5;
          background: rgba(91,80,232,0.12);
          border: 1px solid rgba(91,80,232,0.35);
          padding: 3px 9px; border-radius: 50px;
        }
        .ed-toolbar-right { display: flex; align-items: center; gap: 10px; }
        .ed-credits {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #FFD60A;
        }
        .ed-history-btn {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 8px 16px;
          cursor: pointer; transition: all 0.2s;
        }
        .ed-history-btn:hover, .ed-history-btn.on {
          background: rgba(255,255,255,0.12); color: #fff;
        }

        /* Body layout */
        .ed-body { flex: 1; display: flex; position: relative; min-height: 0; }

        /* Side panel */
        .ed-panel {
          width: 340px; flex-shrink: 0;
          background: #0d0d17;
          border-right: 1px solid rgba(255,255,255,0.07);
          padding: 24px 20px;
          overflow-y: auto;
          display: flex; flex-direction: column; gap: 14px;
        }
        .ed-panel-title {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #fff; margin: 0;
        }
        .ed-panel-sub {
          font-family: 'Inter', sans-serif;
          font-size: 13px; line-height: 1.5;
          color: rgba(255,255,255,0.45); margin: 0;
        }
        .ed-input {
          font-family: 'Inter', sans-serif;
          font-size: 14px; line-height: 1.5;
          color: #fff;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 12px 14px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }
        .ed-input:focus { border-color: rgba(91,80,232,0.5); }
        .ed-input::placeholder { color: rgba(255,255,255,0.25); }
        .ed-input:disabled { opacity: 0.5; }
        .ed-apply {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          border: none; border-radius: 12px;
          padding: 13px 20px; cursor: pointer;
          box-shadow: 0 4px 20px rgba(91,80,232,0.3);
        }
        .ed-apply:disabled { opacity: 0.45; cursor: not-allowed; }
        .ed-working {
          font-family: 'Inter', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.4);
          margin: 0; text-align: center;
        }
        .ed-error {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: #ef4444;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 8px; padding: 10px 14px; margin: 0;
        }
        .ed-upsell {
          background: rgba(91,80,232,0.1);
          border: 1px solid rgba(91,80,232,0.3);
          border-radius: 12px; padding: 16px;
          text-align: center;
        }
        .ed-upsell p {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.7);
          margin: 0 0 10px;
        }
        .ed-upsell button {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          border: none; border-radius: 10px;
          padding: 10px 18px; cursor: pointer;
        }

        /* Quick ideas */
        .ed-ideas { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
        .ed-ideas-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.6px;
          color: rgba(255,255,255,0.3);
        }
        .ed-idea {
          font-family: 'Inter', sans-serif;
          font-size: 13px; text-align: left;
          color: rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 14px;
          cursor: pointer; transition: all 0.2s;
        }
        .ed-idea:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .ed-idea:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Edit log */
        .ed-log { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
        .ed-log-item {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.55);
          display: flex; gap: 8px; align-items: flex-start;
          line-height: 1.4;
        }
        .ed-log-check { color: #00C65A; flex-shrink: 0; }

        /* Preview */
        .ed-preview { flex: 1; position: relative; background: #fff; min-width: 0; }
        .ed-iframe { width: 100%; height: 100%; border: none; display: block; }
        .ed-overlay {
          position: absolute; inset: 0;
          background: rgba(7,5,26,0.75);
          backdrop-filter: blur(3px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 16px;
        }
        .ed-overlay p {
          font-family: 'Inter', sans-serif;
          font-size: 14px; color: rgba(255,255,255,0.8); margin: 0;
        }
        .ed-message {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 16px;
          background: #07051a;
        }
        .ed-message p {
          font-family: 'Inter', sans-serif;
          font-size: 15px; color: rgba(255,255,255,0.5); margin: 0;
        }
        .ed-message button {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600; color: #fff;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px; padding: 10px 24px; cursor: pointer;
        }
        .ed-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(255,255,255,0.15);
          border-top-color: #5b50e8;
          border-radius: 50%;
          animation: edSpin 0.8s linear infinite;
        }
        @keyframes edSpin { to { transform: rotate(360deg); } }

        /* History drawer */
        .ed-history {
          position: absolute; top: 0; right: 0; bottom: 0;
          width: 300px;
          background: #0d0d17;
          border-left: 1px solid rgba(255,255,255,0.08);
          padding: 20px;
          overflow-y: auto;
          z-index: 5;
        }
        .ed-history-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 6px;
        }
        .ed-history-head h3 {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 15px; font-weight: 700; color: #fff; margin: 0;
        }
        .ed-history-head button {
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          font-size: 14px; cursor: pointer;
        }
        .ed-history-sub {
          font-family: 'Inter', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.35);
          margin: 0 0 16px;
        }
        .ed-history-empty {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.3);
        }
        .ed-version {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ed-version-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75);
        }
        .ed-version-date {
          font-family: 'Inter', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.3);
        }
        .ed-version button {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          color: #00C65A;
          background: rgba(0,198,90,0.08);
          border: 1px solid rgba(0,198,90,0.25);
          border-radius: 8px; padding: 7px 14px;
          cursor: pointer; flex-shrink: 0;
        }
        .ed-version button:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Responsive */
        @media (max-width: 860px) {
          .ed-body { flex-direction: column; }
          .ed-panel {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            max-height: 45vh;
          }
          .ed-history { width: 100%; }
          .ed-credits { font-size: 12px; }
        }
      `}</style>
    </div>
  )
}
