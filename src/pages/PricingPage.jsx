import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/useAuth.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    monthly: 19,
    annual: 190,
    tagline: 'Everything you need to get online',
    features: [
      'Publish your website live',
      'Hosting included',
      '20 edits per month',
      'Connect your own domain',
      'Free stock photo gallery',
      'Upload your own photos',
      'Cinematic videos from our template library',
      'Contact form included',
      'Visitor analytics',
    ],
    cta: 'Go Live with Starter',
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    monthly: 49,
    annual: 490,
    tagline: 'For businesses that want it all',
    features: [
      'Everything in Starter',
      '2 custom cinematic videos every month — $30 value',
      '50 edits per month (2.5× Starter)',
      'Priority support',
    ],
    cta: 'Go Live with Pro',
    highlight: true,
  },
]

const CREDIT_PACKS = [
  { key: 'credits_10', amount: 10, price: 8 },
  { key: 'credits_25', amount: 25, price: 18 },
  { key: 'credits_50', amount: 50, price: 30 },
]

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loadingKey, setLoadingKey] = useState(null)
  const [error, setError] = useState('')
  const [billing, setBilling] = useState('monthly') // monthly | annual

  const justGenerated = searchParams.get('ready') === '1'
  const wasCancelled = searchParams.get('checkout') === 'cancelled'

  const maxSavings = Math.max(...PLANS.map(p => p.monthly * 12 - p.annual))

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const checkout = async (priceKey) => {
    if (authLoading) return
    if (!user) {
      navigate(`/auth?mode=signup&next=${encodeURIComponent('/pricing')}`)
      return
    }
    setError('')
    setLoadingKey(priceKey)
    try {
      const res = await fetch(`${API_URL}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceKey, userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoadingKey(null)
    }
  }

  return (
    <div className="pr-page">
      <div className="pr-bg">
        <div className="pr-bg-grid" />
        <div className="pr-bg-orb pr-bg-orb-1" />
        <div className="pr-bg-orb pr-bg-orb-2" />
      </div>

      <nav className="pr-nav">
        <Link to="/" className="pr-nav-logo">
          <img src="/logo.webp" alt="QuikWebsites" className="pr-logo-img" />
        </Link>
        <button className="pr-nav-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </nav>

      <div className="pr-content">
        <motion.div
          className="pr-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="pr-title">
            {justGenerated ? 'Your website is ready.' : 'Pick your plan. Go live today.'}
          </h1>
          <p className="pr-subtitle">
            {justGenerated
              ? 'Pick a plan to publish it, make edits, swap in your own photos, and connect your domain.'
              : 'Publish your website, make edits, swap in your own photos, and connect your domain.'}
          </p>
        </motion.div>

        {wasCancelled && (
          <div className="pr-notice">
            Checkout was cancelled — no worries, your website is saved. Pick a
            plan whenever you're ready.
          </div>
        )}
        {error && <div className="pr-error">{error}</div>}

        {/* ── Billing toggle ── */}
        <div className="pr-toggle-wrap">
          <div className="pr-toggle">
            <button
              className={billing === 'monthly' ? 'pr-toggle-on' : ''}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              className={billing === 'annual' ? 'pr-toggle-on' : ''}
              onClick={() => setBilling('annual')}
            >
              Annual
            </button>
          </div>
          <span className="pr-toggle-badge">
            2 months free — save up to ${maxSavings}
          </span>
        </div>

        {/* ── Plan cards ── */}
        <div className="pr-plans">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              className={`pr-card ${plan.highlight ? 'pr-card-highlight' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              {plan.highlight && <div className="pr-badge">Most Popular</div>}
              <h2 className="pr-plan-name">{plan.name}</h2>
              <p className="pr-plan-tagline">{plan.tagline}</p>
              <div className="pr-price">
                <span className="pr-price-amount">
                  ${billing === 'annual' ? plan.annual : plan.monthly}
                </span>
                <span className="pr-price-period">
                  {billing === 'annual' ? '/year' : '/month'}
                </span>
              </div>
              {billing === 'annual' && (
                <p className="pr-price-note">
                  ${(plan.annual / 12).toFixed(0)}/mo equivalent — save ${plan.monthly * 12 - plan.annual}
                </p>
              )}
              <ul className="pr-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C65A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button
                className={`pr-cta ${plan.highlight ? 'pr-cta-highlight' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loadingKey !== null}
                onClick={() => checkout(billing === 'annual' ? `${plan.key}_annual` : plan.key)}
              >
                {loadingKey === plan.key || loadingKey === `${plan.key}_annual`
                  ? 'Opening checkout...'
                  : plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* ── Credit packs ── */}
        <motion.div
          className="pr-packs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="pr-packs-title">Need more edits?</h3>
          <p className="pr-packs-subtitle">
            Top up anytime. Packs never expire and stack with your monthly edits.
          </p>
          <div className="pr-packs-row">
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.key}
                className="pr-pack"
                disabled={loadingKey !== null}
                onClick={() => checkout(pack.key)}
              >
                <span className="pr-pack-amount">{pack.amount} edits</span>
                <span className="pr-pack-price">
                  {loadingKey === pack.key ? '...' : `$${pack.price}`}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <p className="pr-footnote">
          Cancel anytime. Your website and edits are always saved — even if you
          pause your plan.
        </p>
      </div>

      <style>{`
        .pr-page {
          min-height: 100vh;
          background: #07051a;
          position: relative;
          overflow-x: hidden;
        }

        /* Background */
        .pr-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .pr-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 30%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 30%, black 20%, transparent 70%);
        }
        .pr-bg-orb { position: absolute; border-radius: 50%; filter: blur(140px); opacity: 0.22; }
        .pr-bg-orb-1 { width: 600px; height: 600px; background: #5b50e8; top: -12%; left: -10%; }
        .pr-bg-orb-2 { width: 500px; height: 500px; background: #00C65A; bottom: -10%; right: -10%; }

        /* Nav */
        .pr-nav {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px;
        }
        .pr-nav-logo { display: inline-flex; align-items: center; text-decoration: none; }
        .pr-logo-img {
          height: 120px; width: auto;
          filter: brightness(0) invert(1);
          margin: -36px -20px;
        }
        .pr-nav-back {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          background: none; border: none;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .pr-nav-back:hover { background: rgba(255,255,255,0.08); color: #fff; }

        /* Content */
        .pr-content {
          position: relative; z-index: 2;
          max-width: 920px;
          margin: 0 auto;
          padding: 24px 24px 80px;
        }
        .pr-header { text-align: center; margin-bottom: 40px; }
        .pr-title {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: clamp(30px, 5vw, 46px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          margin: 0 0 14px;
          line-height: 1.15;
        }
        .pr-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: rgba(255,255,255,0.5);
          margin: 0 auto;
          max-width: 480px;
          line-height: 1.6;
        }

        /* Notices */
        .pr-notice, .pr-error {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 12px 18px;
          border-radius: 10px;
          margin: 0 auto 24px;
          max-width: 560px;
          text-align: center;
        }
        .pr-notice {
          color: rgba(255,255,255,0.7);
          background: rgba(255,214,10,0.07);
          border: 1px solid rgba(255,214,10,0.2);
        }
        .pr-error {
          color: #ef4444;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
        }

        /* Billing toggle */
        .pr-toggle-wrap {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .pr-toggle {
          display: inline-flex;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 4px;
        }
        .pr-toggle button {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.5);
          background: none; border: none;
          border-radius: 50px;
          padding: 8px 22px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pr-toggle button.pr-toggle-on {
          color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          box-shadow: 0 2px 12px rgba(91,80,232,0.4);
        }
        .pr-toggle-badge {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          color: #00C65A;
          background: rgba(0,198,90,0.08);
          border: 1px solid rgba(0,198,90,0.25);
          border-radius: 50px;
          padding: 6px 14px;
        }
        .pr-price-note {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #00C65A;
          margin: -16px 0 24px;
        }

        /* Plan cards */
        .pr-plans {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 56px;
        }
        .pr-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
        }
        .pr-card-highlight {
          border-color: rgba(91,80,232,0.5);
          background: linear-gradient(180deg, rgba(91,80,232,0.12), rgba(255,255,255,0.04));
          box-shadow: 0 8px 40px rgba(91,80,232,0.15);
        }
        .pr-badge {
          position: absolute;
          top: -12px; left: 50%;
          transform: translateX(-50%);
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #fff;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          padding: 5px 14px;
          border-radius: 50px;
          box-shadow: 0 4px 16px rgba(91,80,232,0.4);
        }
        .pr-plan-name {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 22px; font-weight: 700;
          color: #fff;
          margin: 0 0 4px;
        }
        .pr-plan-tagline {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin: 0 0 20px;
        }
        .pr-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 24px; }
        .pr-price-amount {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 44px; font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
        }
        .pr-price-period {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.4);
        }
        .pr-features {
          list-style: none;
          margin: 0 0 28px; padding: 0;
          display: flex; flex-direction: column; gap: 12px;
          flex: 1;
        }
        .pr-features li {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          display: flex; align-items: center; gap: 10px;
        }
        .pr-features li svg { flex-shrink: 0; }
        .pr-cta {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 600;
          color: #fff;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 14px 24px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pr-cta:hover { background: rgba(255,255,255,0.13); }
        .pr-cta-highlight {
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          border: none;
          box-shadow: 0 4px 20px rgba(91,80,232,0.35);
        }
        .pr-cta-highlight:hover { opacity: 0.9; background: linear-gradient(135deg, #5b50e8, #7c6af5); }
        .pr-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Credit packs */
        .pr-packs { text-align: center; }
        .pr-packs-title {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 20px; font-weight: 700;
          color: #fff;
          margin: 0 0 6px;
        }
        .pr-packs-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin: 0 0 20px;
        }
        .pr-packs-row {
          display: flex; justify-content: center; gap: 14px;
          flex-wrap: wrap;
        }
        .pr-pack {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 18px 28px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .pr-pack:hover {
          border-color: rgba(0,198,90,0.4);
          background: rgba(0,198,90,0.06);
        }
        .pr-pack:disabled { opacity: 0.5; cursor: not-allowed; }
        .pr-pack-amount {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff;
        }
        .pr-pack-price {
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #00C65A;
        }

        .pr-footnote {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          text-align: center;
          margin: 40px 0 0;
        }

        /* Responsive */
        @media (max-width: 720px) {
          .pr-plans { grid-template-columns: 1fr; }
          .pr-card-highlight { order: -1; }
          .pr-content { padding: 12px 16px 60px; }
        }
      `}</style>
    </div>
  )
}
