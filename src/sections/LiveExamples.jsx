import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────
   Frame config
───────────────────────────────────────────────────────────── */
const FRAME_DIRS   = ['/frames/bella-vista', '/frames/fitlife', '/frames/carefirst', '/frames/lens-light']
const FRAME_COUNTS = [85, 40, 40, 40]
const frameSrc = (biz, n) =>
  `${FRAME_DIRS[biz]}/ezgif-frame-${String(n + 1).padStart(3, '0')}.webp`

/* ─────────────────────────────────────────────────────────────
   Scroll timing
───────────────────────────────────────────────────────────── */
const BIZ_START = 0.08
const BIZ_SPAN  = (1 - BIZ_START) / 4

/* ─────────────────────────────────────────────────────────────
   Business data
───────────────────────────────────────────────────────────── */
const BUSINESSES = [
  {
    name:          'Bella Vista',
    type:          'Italian Restaurant',
    tagline:       'Where every meal tells a story.',
    accent:        '#FFD166',
    bg:            'radial-gradient(ellipse 140% 120% at 55% 45%, #8B2500 0%, #3D0A00 55%, #090005 100%)',
    scrollAmt:     130,
    videoLogo:     'BELLA VISTA',
    videoHeadline: 'Where Tradition\nMeets Taste',
    videoTagline:  'Authentic Italian · Est. 1987 · Little Italy',
  },
  {
    name:          'FitLife Studio',
    type:          'Gym & Wellness',
    tagline:       'Transform your body. Elevate your life.',
    accent:        '#69F0AE',
    bg:            'radial-gradient(ellipse 140% 120% at 55% 45%, #007A2E 0%, #001A08 55%, #000A02 100%)',
    scrollAmt:     120,
    videoLogo:     'FITLIFE',
    videoHeadline: 'Built for\nChampions',
    videoTagline:  '500+ members. One community. Zero excuses.',
  },
  {
    name:          'CareFirst Clinic',
    type:          'Healthcare',
    tagline:       'Your health, our story.',
    accent:        '#80D8FF',
    bg:            'radial-gradient(ellipse 140% 120% at 55% 45%, #0050B4 0%, #001540 55%, #000510 100%)',
    scrollAmt:     140,
    videoLogo:     'CAREFIRST',
    videoHeadline: 'Healthcare\nWith Heart',
    videoTagline:  'Expert care. Genuine compassion. Always.',
  },
  {
    name:          'Lens & Light',
    type:          'Photography Studio',
    tagline:       'Every frame is a feeling.',
    accent:        '#FFD54F',
    bg:            'radial-gradient(ellipse 140% 120% at 55% 45%, #5C3D00 0%, #1A1000 55%, #050303 100%)',
    scrollAmt:     150,
    videoLogo:     'LENS & LIGHT',
    videoHeadline: 'Your Story,\nPerfectly Framed',
    videoTagline:  'Award-winning photography · 12 years of artistry',
  },
]

/* ─────────────────────────────────────────────────────────────
   Easing
───────────────────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const mapR  = (v, a, b)   => (v - a) / (b - a)
const eOut3 = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
const eOut2 = t => 1 - Math.pow(1 - clamp(t, 0, 1), 2)
const eIn3  = t => Math.pow(clamp(t, 0, 1), 3)
const eIn2  = t => Math.pow(clamp(t, 0, 1), 2)

/* ─────────────────────────────────────────────────────────────
   CountUp hook — animates 0 → target when active flips true
───────────────────────────────────────────────────────────── */
function useCountUp(target, active, duration = 900) {
  const [val, setVal] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (!active) { setVal(0); return }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(ease * target))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, target, duration])
  return val
}

/* ─────────────────────────────────────────────────────────────
   Framer Motion variants
───────────────────────────────────────────────────────────── */
const containerV = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
}
const sectionV = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
// For individual items inside sections
const itemV = {
  hidden:  { opacity: 0, y: 16, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const itemLeftV = {
  hidden:  { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
const itemRightV = {
  hidden:  { opacity: 0, x: 14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
const scaleV = {
  hidden:  { opacity: 0, scale: 0.82 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } },
}

/* ─────────────────────────────────────────────────────────────
   Sub-container that staggers its own children
───────────────────────────────────────────────────────────── */
const subContainerV = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

/* ─────────────────────────────────────────────────────────────
   MINI WEBSITE — Bella Vista
───────────────────────────────────────────────────────────── */
function BellaVistaWebsite({ visible }) {
  const a = visible ? 'visible' : 'hidden'
  return (
    <motion.div className="mw-wrap" variants={containerV} animate={a} initial="hidden">

      {/* Brand bar */}
      <motion.div variants={sectionV} className="mw-brand-bar" style={{ background: '#0E0100', borderColor: 'rgba(255,209,102,0.14)' }}>
        <span className="mw-brand-name" style={{ color: '#FFD166' }}>BELLA VISTA</span>
        <span className="mw-brand-tag" style={{ color: 'rgba(255,209,102,0.5)' }}>Little Italy · Est. 1987</span>
      </motion.div>

      {/* Signature Dishes */}
      <motion.div variants={sectionV} className="mw-big-section" style={{ background: '#0c0200' }}>
        <div className="mw-section-header">
          <div className="mw-label" style={{ color: '#FFD166' }}>Signature Dishes</div>
          <div className="mw-header-sub" style={{ color: 'rgba(255,255,255,0.35)' }}>Crafted with tradition</div>
        </div>
        <motion.div className="mw-dish-showcase" variants={subContainerV}>
          {/* Main large dish */}
          <motion.div variants={itemV} className="mw-dish-feature" style={{ borderColor: 'rgba(255,209,102,0.18)' }}>
            <div className="mw-dish-photo-lg mw-img-wrap">
              <img src="/images/bella-herodish.webp" alt="Spaghetti Carbonara" className="mw-photo-real" />
              <div className="mw-img-shine" />
            </div>
            <div className="mw-dish-info">
              <span className="mw-dish-feat-name" style={{ color: '#fff' }}>Spaghetti Carbonara</span>
              <span className="mw-dish-feat-price bv-shimmer-price" style={{ color: '#FFD166' }}>$24</span>
            </div>
          </motion.div>
          {/* Two smaller */}
          <motion.div variants={subContainerV} className="mw-dish-pair">
            <motion.div variants={itemLeftV} className="mw-dish-sm" style={{ background: '#1a0400', borderColor: 'rgba(255,209,102,0.10)' }}>
              <div className="mw-dish-photo-sm mw-img-wrap">
                <img src="/images/bella-bistecca.webp" alt="Bistecca" className="mw-photo-real" />
              </div>
              <div className="mw-dish-sm-name" style={{ color: '#fff' }}>Bistecca</div>
              <div className="bv-shimmer-price" style={{ color: '#FFD166', fontSize: 9, fontWeight: 800 }}>$42</div>
            </motion.div>
            <motion.div variants={itemRightV} className="mw-dish-sm" style={{ background: '#1a0400', borderColor: 'rgba(255,209,102,0.10)' }}>
              <div className="mw-dish-photo-sm mw-img-wrap">
                <img src="/images/bella-tiramisu.webp" alt="Tiramisu" className="mw-photo-real" />
              </div>
              <div className="mw-dish-sm-name" style={{ color: '#fff' }}>Tiramisu</div>
              <div className="bv-shimmer-price" style={{ color: '#FFD166', fontSize: 9, fontWeight: 800 }}>$13</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Reserve section */}
      <motion.div variants={sectionV} className="mw-reserve-section" style={{ background: '#080100' }}>
        <div className="mw-ambiance-wrap">
          <img src="/images/bella-ambiance.webp" alt="Restaurant ambiance" className="mw-ambiance-real" />
          <div className="mw-ambiance-overlay" />
        </div>
        <div className="mw-reserve-content">
          <motion.div variants={itemV} className="mw-stars" style={{ color: '#FFD166' }}>★★★★★</motion.div>
          <motion.div variants={itemV} className="mw-reserve-quote">"The best Italian food outside of Italy."</motion.div>
          <motion.div variants={itemV} className="mw-reserve-attr" style={{ color: 'rgba(255,209,102,0.6)' }}>— Marco R.</motion.div>
          <motion.div variants={itemV} className="mw-solid-btn mw-glow-btn" style={{ background: '#FFD166', color: '#140000', '--glow': 'rgba(255,209,102,0.45)' }}>Reserve a Table →</motion.div>
        </div>
      </motion.div>

      <motion.div variants={sectionV} className="mw-footer" style={{ background: '#060000' }}>
        <span style={{ color: 'rgba(255,209,102,0.35)' }}>© 2025 Bella Vista · Built with QuikWebsites</span>
      </motion.div>

    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MINI WEBSITE — FitLife Studio
───────────────────────────────────────────────────────────── */
const FL_STATS = [['500', 'Members'], ['20+', 'Classes/wk'], ['98%', 'Retention']]
const FL_CLASSES = [
  ['6:00 AM', 'HIIT Blast', 3,  8,  '#22C55E'],
  ['9:00 AM', 'Yoga Flow',  8,  10, '#22D3EE'],
  ['12:00 PM','Strength',   0,  12, '#F59E0B'],
  ['5:30 PM', 'Boxing',     5,  10, '#A78BFA'],
]

function FitStat({ label, value, active }) {
  const numericTarget = parseInt(value.replace(/\D/g, ''), 10) || 0
  const suffix = value.replace(/[0-9]/g, '')
  const counted = useCountUp(numericTarget, active, 1100)
  return (
    <div className="mw-stat-mini">
      <div className="mw-stat-mini-n" style={{ color: '#69F0AE' }}>{counted}{suffix}</div>
      <div className="mw-stat-mini-l">{label}</div>
    </div>
  )
}

function FitLifeWebsite({ visible }) {
  const a = visible ? 'visible' : 'hidden'
  return (
    <motion.div className="mw-wrap" variants={containerV} animate={a} initial="hidden">

      {/* Brand bar */}
      <motion.div variants={sectionV} className="mw-brand-bar" style={{ background: '#010A03', borderColor: 'rgba(105,240,174,0.12)' }}>
        <span className="mw-brand-name" style={{ color: '#69F0AE' }}>FITLIFE</span>
        <span className="mw-brand-tag" style={{ color: 'rgba(105,240,174,0.5)' }}>Gym & Wellness · 500+ Members</span>
      </motion.div>

      {/* Atmosphere + Stats */}
      <motion.div variants={sectionV} className="mw-big-section" style={{ background: '#010A03' }}>
        <div className="mw-atmos-wrap">
          <img src="/images/fitlife-gym.webp" alt="Gym floor" className="mw-atmos-real" />
          <div className="mw-atmos-overlay" />
        </div>
        <div className="mw-stats-overlay" style={{ background: 'rgba(1,10,3,0.85)' }}>
          {FL_STATS.map(([n, l]) => (
            <FitStat key={l} label={l} value={n} active={visible} />
          ))}
        </div>
      </motion.div>

      {/* Today's classes */}
      <motion.div variants={sectionV} className="mw-section" style={{ background: '#000D04' }}>
        <div className="mw-label" style={{ color: '#69F0AE' }}>Today's Classes</div>
        <motion.div variants={subContainerV}>
          {FL_CLASSES.map(([t, n, spots, total, c]) => {
            const full = spots === 0
            const pct = full ? 100 : Math.round(((total - spots) / total) * 100)
            return (
              <motion.div key={n} variants={itemLeftV} className="mw-class-row" style={{ borderColor: 'rgba(105,240,174,0.09)' }}>
                <span className="mw-class-time">{t}</span>
                <div className="mw-class-body">
                  <span className="mw-class-name">{n}</span>
                  <div className="mw-class-bar-wrap">
                    <div className="mw-class-bar-bg">
                      <motion.div
                        className="mw-class-bar-fill"
                        style={{ background: c }}
                        initial={{ width: 0 }}
                        animate={visible ? { width: `${pct}%` } : { width: 0 }}
                        transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                </div>
                <span className="mw-class-pill" style={{ background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
                  {full ? 'Full' : `${spots} left`}
                </span>
                {!full && <span className="mw-class-dot" style={{ background: c }} />}
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      {/* Trainer */}
      <motion.div variants={sectionV} className="mw-trainer-feature" style={{ background: '#010A03', borderColor: 'rgba(105,240,174,0.1)' }}>
        <motion.div variants={scaleV} className="mw-trainer-photo-wrap">
          <img src="/images/fitlife-trainer.webp" alt="Trainer" className="mw-trainer-real" />
          <div className="mw-trainer-ring" style={{ borderColor: '#69F0AE' }} />
        </motion.div>
        <div className="mw-trainer-info">
          <div className="mw-trainer-feat-name" style={{ color: '#fff' }}>Jake Davis</div>
          <div className="mw-trainer-feat-role" style={{ color: '#69F0AE' }}>Head Trainer · 8 yrs exp</div>
          <div className="mw-solid-btn sm mw-glow-btn" style={{ background: '#69F0AE', color: '#001A08', '--glow': 'rgba(105,240,174,0.4)' }}>Start Free Trial →</div>
        </div>
      </motion.div>

      <motion.div variants={sectionV} className="mw-footer" style={{ background: '#000802' }}>
        <span style={{ color: 'rgba(105,240,174,0.35)' }}>© 2025 FitLife Studio · Built with QuikWebsites</span>
      </motion.div>

    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MINI WEBSITE — CareFirst Clinic
───────────────────────────────────────────────────────────── */
const CF_SERVICES = [
  ['🩺','General Care','Primary & preventive'],
  ['🦷','Dental','Comprehensive dental'],
  ['👁️','Vision','Eye care & surgery'],
  ['🧠','Mental Health','Therapy & counselling'],
  ['🦴','Orthopedics','Bone & joint care'],
  ['❤️','Cardiology','Heart specialists'],
]

function CareFirstWebsite({ visible }) {
  const a = visible ? 'visible' : 'hidden'
  return (
    <motion.div className="mw-wrap" variants={containerV} animate={a} initial="hidden">

      {/* Brand bar */}
      <motion.div variants={sectionV} className="mw-brand-bar" style={{ background: '#000815', borderColor: 'rgba(128,216,255,0.12)' }}>
        <span className="mw-brand-name" style={{ color: '#80D8FF' }}>CAREFIRST</span>
        <span className="mw-brand-tag" style={{ color: 'rgba(128,216,255,0.5)' }}>Healthcare · 10K+ Patients</span>
      </motion.div>

      {/* Services */}
      <motion.div variants={sectionV} className="mw-big-section" style={{ background: '#000C1E' }}>
        <div className="mw-label" style={{ color: '#80D8FF' }}>Our Services</div>
        <motion.div className="mw-service-grid-2" variants={subContainerV}>
          {CF_SERVICES.map(([icon, name, desc]) => (
            <motion.div
              key={name}
              variants={itemV}
              className="mw-service-card cf-card-glow"
              style={{ background: 'rgba(128,216,255,0.06)', borderColor: 'rgba(128,216,255,0.13)' }}
            >
              <motion.span
                className="mw-service-icon"
                animate={visible ? { scale: [1, 1.18, 1] } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              >{icon}</motion.span>
              <div className="mw-service-name" style={{ color: '#fff' }}>{name}</div>
              <div className="mw-service-desc" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Meet the team */}
      <motion.div variants={sectionV} className="mw-section" style={{ background: '#000810' }}>
        <div className="mw-label" style={{ color: '#80D8FF' }}>Meet Our Doctors</div>
        <motion.div className="mw-doctor-row" variants={subContainerV}>
          {[
            { img: '/images/care-sarah.webp', name: 'Dr. Sarah Lee', spec: 'Family Medicine' },
            { img: '/images/care-mike.webp',  name: 'Dr. Mike Kim',  spec: 'Cardiology' },
          ].map((doc, idx) => (
            <motion.div
              key={doc.name}
              variants={idx === 0 ? itemLeftV : itemRightV}
              className="mw-doctor-card"
              style={{ background: 'rgba(128,216,255,0.05)', borderColor: 'rgba(128,216,255,0.12)' }}
            >
              <div className="mw-doctor-photo-wrap">
                <img src={doc.img} alt={doc.name} className="mw-doctor-real" />
                <div className="mw-doctor-glow" style={{ background: 'radial-gradient(circle at 50% 100%, rgba(128,216,255,0.18) 0%, transparent 70%)' }} />
              </div>
              <div className="mw-doctor-name" style={{ color: '#fff' }}>{doc.name}</div>
              <div className="mw-doctor-spec" style={{ color: '#80D8FF' }}>{doc.spec}</div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={itemV} className="mw-solid-btn full mw-glow-btn" style={{ background: '#80D8FF', color: '#001535', marginTop: 14, '--glow': 'rgba(128,216,255,0.4)' }}>Book Appointment →</motion.div>
      </motion.div>

      <motion.div variants={sectionV} className="mw-footer" style={{ background: '#000508' }}>
        <span style={{ color: 'rgba(128,216,255,0.35)' }}>© 2025 CareFirst Clinic · Built with QuikWebsites</span>
      </motion.div>

    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MINI WEBSITE — Lens & Light
───────────────────────────────────────────────────────────── */
const LL_PORTFOLIO = [
  { src: '/images/lens-portrait.webp',  caption: 'Portraits'  },
  { src: '/images/lens-wedding.webp',   caption: 'Weddings'   },
  { src: '/images/lens-landscape.webp', caption: 'Editorial'  },
  { src: '/images/lens-lifestyle.webp', caption: 'Lifestyle'  },
]
const LL_PACKAGES = [
  ['Essential', 'Half day · 30 edits',             '$800'],
  ['Premium',   'Full day · 80 edits · album',     '$1,500'],
  ['Signature', 'Unlimited · premium edit + print','$2,800'],
]

function LensLightWebsite({ visible }) {
  const a = visible ? 'visible' : 'hidden'
  return (
    <motion.div className="mw-wrap" variants={containerV} animate={a} initial="hidden">

      {/* Brand bar */}
      <motion.div variants={sectionV} className="mw-brand-bar" style={{ background: '#030302', borderColor: 'rgba(255,213,79,0.12)' }}>
        <span className="mw-brand-name" style={{ color: '#FFD54F', fontSize: 9 }}>LENS & LIGHT</span>
        <span className="mw-brand-tag" style={{ color: 'rgba(255,213,79,0.5)' }}>Photography · Award-Winning</span>
      </motion.div>

      {/* Portfolio grid */}
      <motion.div variants={sectionV} className="mw-big-section" style={{ background: '#080600' }}>
        <div className="mw-label" style={{ color: '#FFD54F' }}>Featured Work</div>
        <motion.div className="mw-portfolio-grid" variants={subContainerV}>
          {LL_PORTFOLIO.map((p, idx) => (
            <motion.div
              key={p.caption}
              variants={{
                hidden:  { opacity: 0, scale: 0.78, rotate: idx % 2 === 0 ? -3 : 3 },
                visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.65, ease: [0.34, 1.56, 0.64, 1], delay: idx * 0.07 } },
              }}
              className="mw-portfolio-item"
            >
              <div className="mw-portfolio-photo mw-img-wrap ll-photo-frame">
                <img src={p.src} alt={p.caption} className="mw-photo-real" />
                <div className="ll-photo-vignette" />
              </div>
              <div className="mw-portfolio-cap" style={{ color: 'rgba(255,213,79,0.65)' }}>{p.caption}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Packages */}
      <motion.div variants={sectionV} className="mw-section" style={{ background: '#060400' }}>
        <div className="mw-label" style={{ color: '#FFD54F' }}>Packages</div>
        <motion.div variants={subContainerV}>
          {LL_PACKAGES.map(([name, desc, price], idx) => (
            <motion.div
              key={name}
              variants={itemLeftV}
              className="mw-pkg-row"
              style={{ borderColor: 'rgba(255,213,79,0.1)' }}
            >
              <div>
                <div className="mw-pkg-name" style={{ color: '#fff' }}>{name}</div>
                <div className="mw-pkg-desc" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</div>
              </div>
              <motion.div
                className="mw-pkg-price"
                style={{ color: '#FFD54F' }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.5, delay: 0.25 + idx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              >{price}</motion.div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={itemV} className="mw-solid-btn full mw-glow-btn" style={{ background: '#FFD54F', color: '#1a0d00', marginTop: 12, '--glow': 'rgba(255,213,79,0.4)' }}>Book Your Session →</motion.div>
      </motion.div>

      <motion.div variants={sectionV} className="mw-footer" style={{ background: '#030200' }}>
        <span style={{ color: 'rgba(255,213,79,0.35)' }}>© 2025 Lens & Light · Built with QuikWebsites</span>
      </motion.div>

    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function LiveExamples() {
  const sectionRef     = useRef(null)
  const introRef       = useRef(null)
  const bgRefs         = useRef([])
  const textRefs       = useRef([])
  const phoneRefs      = useRef([])
  const frameRefs      = useRef([])
  const voLogoRefs     = useRef([])
  const voHdRefs       = useRef([])
  const voTlRefs       = useRef([])
  const siteRefs       = useRef([])
  const contentRefs    = useRef([])

  const [visibleWebsites, setVisibleWebsites] = useState([false, false, false, false])
  const visibleTracker = useRef([false, false, false, false])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    BUSINESSES.forEach((_, i) => {
      [0, Math.floor(FRAME_COUNTS[i] / 2), FRAME_COUNTS[i] - 1].forEach(n => {
        const img = new Image(); img.src = frameSrc(i, n)
      })
    })

    let ctx
    const rafId = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start:   'top top',
          end:     'bottom bottom',
          scrub:   1.2,

          onUpdate(self) {
            const p = self.progress

            /* ── Intro heading ── */
            const introEl = introRef.current
            if (introEl) {
              const introOp =
                p < 0.02 ? eOut3(p / 0.02) :
                p < 0.05 ? 1 :
                p < 0.08 ? eOut2((0.08 - p) / 0.03) : 0
              const introY =
                p < 0.02 ? (1 - eOut3(p / 0.02)) * 44 :
                p < 0.05 ? 0 :
                p < 0.08 ? -eIn2((p - 0.05) / 0.03) * 22 : -22
              introEl.style.opacity   = introOp
              introEl.style.transform = `translateY(${introY}px)`
            }

            /* ── Per-business ── */
            BUSINESSES.forEach((biz, i) => {
              const lp = clamp((p - BIZ_START - i * BIZ_SPAN) / BIZ_SPAN, 0, 1)

              /* Background */
              const bgEl = bgRefs.current[i]
              if (bgEl) {
                bgEl.style.opacity =
                  lp < 0.05 ? eOut2(lp / 0.05) :
                  lp > 0.95 ? eOut2((1 - lp) / 0.05) : 1
              }

              /* Business name text */
              const txtEl = textRefs.current[i]
              if (txtEl) {
                const textOp =
                  lp < 0.10 ? eOut3(lp / 0.10) :
                  lp < 0.14 ? 1 :
                  lp < 0.24 ? Math.max(0, 1 - eIn2((lp - 0.14) / 0.10)) : 0
                const textY =
                  lp < 0.10 ? (1 - eOut3(lp / 0.10)) * 36 :
                  lp < 0.14 ? 0 :
                  lp < 0.24 ? -eIn2((lp - 0.14) / 0.10) * 24 : -24
                txtEl.style.opacity   = textOp
                txtEl.style.transform = `translateY(${textY}px)`
              }

              /* Phone rise / hold / sink */
              const phoneEl = phoneRefs.current[i]
              if (phoneEl) {
                let yVh
                if      (lp < 0.14) yVh = 110
                else if (lp < 0.28) yVh = 110 * (1 - eOut3((lp - 0.14) / 0.14))
                else if (lp < 0.90) yVh = 0
                else                yVh = 110 * eIn3((lp - 0.90) / 0.10)
                phoneEl.style.opacity   = lp < 0.14 || lp > 0.98 ? 0 : 1
                phoneEl.style.transform =
                  `translateX(-50%) translateY(calc(-50% + ${yVh}vh))`
              }

              /* Frame scrubbing */
              const frameImg = frameRefs.current[i]
              if (frameImg) {
                const frameP = clamp(mapR(lp, 0.28, 0.64), 0, 1)
                const frameN = Math.round(frameP * (FRAME_COUNTS[i] - 1))
                const newSrc = frameSrc(i, frameN)
                if (frameImg.dataset.cur !== newSrc) {
                  frameImg.src         = newSrc
                  frameImg.dataset.cur = newSrc
                }
                frameImg.style.opacity =
                  lp < 0.28 ? 0 :
                  lp < 0.31 ? eOut2((lp - 0.28) / 0.03) :
                  lp < 0.64 ? 1 :
                  lp < 0.74 ? eOut2((0.74 - lp) / 0.10) : 0
              }

              /* Video overlay */
              const logoEl = voLogoRefs.current[i]
              const hdEl   = voHdRefs.current[i]
              const tlEl   = voTlRefs.current[i]
              const overlayOut = lp < 0.62 ? 1 : lp < 0.72 ? eOut2((0.72 - lp) / 0.10) : 0
              if (logoEl) {
                logoEl.style.opacity =
                  lp < 0.32 ? 0 :
                  lp < 0.40 ? eOut3((lp - 0.32) / 0.08) * overlayOut : overlayOut
                logoEl.style.transform =
                  lp < 0.32 ? 'translateX(-8px)' :
                  lp < 0.40 ? `translateX(${-8 * (1 - eOut3((lp - 0.32) / 0.08))}px)` : 'translateX(0)'
              }
              if (hdEl) {
                hdEl.style.opacity =
                  lp < 0.40 ? 0 :
                  lp < 0.50 ? eOut3((lp - 0.40) / 0.10) * overlayOut : overlayOut
                hdEl.style.transform =
                  lp < 0.40 ? 'translateY(10px)' :
                  lp < 0.50 ? `translateY(${10 * (1 - eOut3((lp - 0.40) / 0.10))}px)` : 'translateY(0)'
              }
              if (tlEl) {
                tlEl.style.opacity =
                  lp < 0.50 ? 0 :
                  lp < 0.58 ? eOut2((lp - 0.50) / 0.08) * overlayOut : overlayOut
              }

              /* Website crossfade */
              const siteEl = siteRefs.current[i]
              if (siteEl) {
                siteEl.style.opacity =
                  lp < 0.67 ? 0 :
                  lp < 0.74 ? eOut2((lp - 0.67) / 0.07) :
                  lp < 0.91 ? 1 :
                  lp < 0.96 ? eOut2((0.96 - lp) / 0.05) : 0
              }

              /* Website content scroll */
              const cEl = contentRefs.current[i]
              if (cEl) {
                const scrollP = eOut3(clamp(mapR(lp, 0.74, 0.91), 0, 1))
                cEl.style.transform = `translateY(${-scrollP * biz.scrollAmt}px)`
              }

              /* Framer Motion trigger */
              const shouldShow = lp > 0.69 && lp < 0.93
              if (visibleTracker.current[i] !== shouldShow) {
                visibleTracker.current[i] = shouldShow
                setVisibleWebsites([...visibleTracker.current])
              }
            })
          },
        })
      }, section)
    })

    return () => { cancelAnimationFrame(rafId); ctx?.revert() }
  }, [])

  return (
    <section ref={sectionRef} className="le2-section">
      <div className="le2-sticky">

        {/* ── Intro heading ── */}
        <div ref={introRef} className="le2-intro" style={{ opacity: 0 }}>
          <p className="le2-intro-eyebrow">
            <span className="le2-intro-dot" />
            Live Examples
          </p>
          <h2 className="le2-intro-title">
            See What <span className="le2-intro-accent">You</span> Can Build
          </h2>
          <p className="le2-intro-sub">
            Real websites. Real businesses. Built in minutes.
          </p>
        </div>

        {/* ── Colored BGs ── */}
        {BUSINESSES.map((biz, i) => (
          <div key={i} ref={el => { bgRefs.current[i] = el }}
            className="le2-bg" style={{ background: biz.bg }} />
        ))}

        {/* ── Business name text ── */}
        {BUSINESSES.map((biz, i) => (
          <div key={i} ref={el => { textRefs.current[i] = el }} className="le2-text-layer">
            <p className="le2-biz-type" style={{ color: biz.accent }}>{biz.type.toUpperCase()}</p>
            <h2 className="le2-biz-name">{biz.name}</h2>
            <p className="le2-biz-tagline">"{biz.tagline}"</p>
          </div>
        ))}

        {/* ── Phone mockups ── */}
        {BUSINESSES.map((biz, i) => (
          <div key={i} ref={el => { phoneRefs.current[i] = el }} className="le2-phone-outer">
            <div className="le2-phone-bezel">

              <div className="le2-island" />

              {/* Frame scrub image */}
              <img
                ref={el => { frameRefs.current[i] = el }}
                className="le2-frame-img"
                src={frameSrc(i, 0)}
                alt=""
                draggable={false}
                style={{ opacity: 0 }}
              />

              {/* Video overlay */}
              <div className="le2-vo-wrap">
                <div className="le2-vo-gradient" />
                <div ref={el => { voLogoRefs.current[i] = el }}
                  className="le2-vo-logo"
                  style={{ color: biz.accent, opacity: 0, transform: 'translateX(-8px)' }}>
                  {biz.videoLogo}
                </div>
                <div className="le2-vo-body">
                  <div ref={el => { voHdRefs.current[i] = el }}
                    className="le2-vo-headline"
                    style={{ opacity: 0, transform: 'translateY(10px)' }}>
                    {biz.videoHeadline.split('\n').map((line, j) => (
                      <span key={j}>{line}{j === 0 && <br />}</span>
                    ))}
                  </div>
                  <div ref={el => { voTlRefs.current[i] = el }}
                    className="le2-vo-tagline"
                    style={{ opacity: 0 }}>
                    {biz.videoTagline}
                  </div>
                </div>
              </div>

              {/* Mini website */}
              <div ref={el => { siteRefs.current[i] = el }}
                className="le2-site-wrap" style={{ opacity: 0, zIndex: 8 }}>
                <div ref={el => { contentRefs.current[i] = el }} className="le2-site-content">
                  {i === 0 && <BellaVistaWebsite visible={visibleWebsites[0]} />}
                  {i === 1 && <FitLifeWebsite    visible={visibleWebsites[1]} />}
                  {i === 2 && <CareFirstWebsite  visible={visibleWebsites[2]} />}
                  {i === 3 && <LensLightWebsite  visible={visibleWebsites[3]} />}
                </div>
              </div>

              <div className="le2-home-bar" />
            </div>

            <div className="le2-badge" style={{ color: biz.accent }}>
              ✦ Built with QuikWebsites
            </div>
          </div>
        ))}

      </div>

      <style>{`

        /* ── Section ── */
        .le2-section {
          position: relative;
          height: 1200vh;
          background: #080810;
        }
        .le2-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
        }

        /* ── Intro heading ── */
        .le2-intro {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 14px;
          z-index: 15;
          pointer-events: none;
          will-change: opacity, transform;
        }
        .le2-intro-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 14px;
          border-radius: 100px;
          margin: 0;
        }
        .le2-intro-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ADE80;
          display: inline-block;
          flex-shrink: 0;
        }
        .le2-intro-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(40px, 7vw, 80px);
          font-weight: 900;
          color: #fff;
          line-height: 1.0;
          letter-spacing: -2px;
          margin: 0;
        }
        .le2-intro-accent { color: #4ADE80; }
        .le2-intro-sub {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.38);
          margin: 0;
        }

        /* ── Backgrounds ── */
        .le2-bg {
          position: absolute;
          inset: 0;
          opacity: 0;
          will-change: opacity;
          z-index: 1;
        }

        /* ── Business text ── */
        .le2-text-layer {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
          opacity: 0;
          will-change: opacity, transform;
          z-index: 10;
          pointer-events: none;
          padding: 0 24px;
        }
        .le2-biz-type {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3.5px;
          margin: 0;
        }
        .le2-biz-name {
          font-family: 'Inter', sans-serif;
          font-size: clamp(52px, 9vw, 100px);
          font-weight: 900;
          color: #fff;
          line-height: 0.95;
          letter-spacing: -3px;
          margin: 0;
        }
        .le2-biz-tagline {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.42);
          font-style: italic;
          margin: 0;
        }

        /* ── Phone outer ── */
        .le2-phone-outer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translateX(-50%) translateY(calc(-50% + 110vh));
          opacity: 0;
          will-change: transform, opacity;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
        }

        /* ── Phone bezel ── */
        .le2-phone-bezel {
          width: 300px;
          height: 614px;
          background: #0A0A0D;
          border-radius: 46px;
          border: 2px solid rgba(255,255,255,0.08);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 50px 120px rgba(0,0,0,0.9),
            0 20px 50px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.07),
            inset 0 -1px 0 rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }

        /* ── Dynamic island ── */
        .le2-island {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 116px;
          height: 34px;
          background: #000;
          border-radius: 17px;
          z-index: 40;
          pointer-events: none;
        }

        /* ── Frame image ── */
        .le2-frame-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 5;
          will-change: opacity;
          pointer-events: none;
        }

        /* ── Video overlay ── */
        .le2-vo-wrap {
          position: absolute;
          inset: 0;
          z-index: 6;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 16px 28px;
          pointer-events: none;
        }
        .le2-vo-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.42) 0%,
            transparent 30%,
            transparent 52%,
            rgba(0,0,0,0.78) 100%
          );
          pointer-events: none;
        }
        .le2-vo-logo {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2.5px;
          position: relative;
          will-change: opacity, transform;
        }
        .le2-vo-body {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .le2-vo-headline {
          font-family: 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -0.5px;
          will-change: opacity, transform;
        }
        .le2-vo-tagline {
          font-family: 'Inter', sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          will-change: opacity;
        }

        /* ── Site wrap ── */
        .le2-site-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 8;
          will-change: opacity;
        }
        .le2-site-content {
          width: 100%;
          will-change: transform;
          position: relative;
        }

        /* ── Home bar ── */
        .le2-home-bar {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 132px;
          height: 5px;
          background: rgba(255,255,255,0.30);
          border-radius: 3px;
          z-index: 50;
          pointer-events: none;
        }

        /* ── Badge ── */
        .le2-badge {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          opacity: 0.6;
        }

        /* ═══════════════════════════════════════════
           MINI WEBSITE STYLES
        ═══════════════════════════════════════════ */
        .mw-wrap {
          width: 100%;
          font-family: 'Inter', sans-serif;
          background: #080808;
        }

        /* Brand bar */
        .mw-brand-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          border-bottom: 1px solid;
        }
        .mw-brand-name {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .mw-brand-tag {
          font-size: 7.5px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        /* Sections */
        .mw-big-section { padding: 16px 16px 20px; }
        .mw-section { padding: 16px 16px 20px; }
        .mw-section-header { margin-bottom: 12px; }
        .mw-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .mw-header-sub {
          font-size: 8px;
          font-weight: 400;
        }

        /* ── Image handling ── */
        .mw-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }
        .mw-photo-real {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: inherit;
        }
        /* Subtle shine overlay */
        .mw-img-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%);
          pointer-events: none;
          border-radius: inherit;
        }

        /* Dish showcase (Bella Vista) */
        .mw-dish-showcase { display: flex; flex-direction: column; gap: 8px; }
        .mw-dish-feature {
          border: 1px solid;
          border-radius: 10px;
          overflow: hidden;
        }
        .mw-dish-photo-lg {
          height: 110px;
          width: 100%;
          border-radius: 0;
        }
        .mw-dish-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
        }
        .mw-dish-feat-name { font-size: 10px; font-weight: 700; }
        .mw-dish-feat-price { font-size: 11px; font-weight: 900; }
        .mw-dish-pair { display: flex; gap: 8px; }
        .mw-dish-sm {
          flex: 1;
          border-radius: 10px;
          border: 1px solid;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .mw-dish-photo-sm { height: 60px; }
        .mw-dish-sm-name { font-size: 9px; font-weight: 700; }

        /* Shimmer price animation (Bella Vista) */
        @keyframes bv-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .bv-shimmer-price {
          background: linear-gradient(90deg, #FFD166 0%, #fff3b0 40%, #FFD166 60%, #FFD166 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: bv-shimmer 2.8s linear infinite;
        }

        /* Reserve section (Bella Vista) */
        .mw-reserve-section { overflow: hidden; }
        .mw-ambiance-wrap {
          position: relative;
          height: 120px;
          overflow: hidden;
        }
        .mw-ambiance-real {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .mw-ambiance-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(8,1,0,0.85) 100%);
        }
        .mw-reserve-content { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 6px; }
        .mw-reserve-quote { font-size: 10px; font-style: italic; color: rgba(255,255,255,0.65); }
        .mw-reserve-attr { font-size: 8px; }

        /* Stats overlay (FitLife) */
        .mw-atmos-wrap {
          position: relative;
          height: 140px;
          border-radius: 10px;
          overflow: hidden;
        }
        .mw-atmos-real {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .mw-atmos-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(1,10,3,0.7) 100%);
        }
        .mw-stats-overlay {
          display: flex;
          justify-content: space-around;
          padding: 12px 8px;
          border-radius: 10px;
          margin-top: 8px;
        }
        .mw-stat-mini { text-align: center; }
        .mw-stat-mini-n { font-size: 16px; font-weight: 900; line-height: 1; }
        .mw-stat-mini-l { font-size: 7px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

        /* Classes rows (FitLife) */
        .mw-class-row {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 0; border-bottom: 1px solid;
          position: relative;
        }
        .mw-class-time { font-size: 7px; color: rgba(255,255,255,0.3); width: 46px; flex-shrink: 0; }
        .mw-class-body { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .mw-class-name { font-size: 9px; font-weight: 700; color: #fff; }
        .mw-class-bar-wrap { width: 100%; }
        .mw-class-bar-bg {
          height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .mw-class-bar-fill {
          height: 100%;
          border-radius: 2px;
        }
        .mw-class-pill { font-size: 7px; font-weight: 700; padding: 2px 6px; border-radius: 8px; flex-shrink: 0; }
        @keyframes fl-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        .mw-class-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          animation: fl-pulse 1.6s ease-in-out infinite;
        }

        /* Trainer feature (FitLife) */
        .mw-trainer-feature {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border-top: 1px solid;
        }
        .mw-trainer-photo-wrap {
          position: relative;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
        }
        .mw-trainer-real {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }
        .mw-trainer-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid;
          opacity: 0.5;
          animation: fl-pulse 2s ease-in-out infinite;
        }
        .mw-trainer-info { display: flex; flex-direction: column; gap: 3px; }
        .mw-trainer-feat-name { font-size: 11px; font-weight: 800; }
        .mw-trainer-feat-role { font-size: 8px; }

        /* Service grid (CareFirst) */
        .mw-service-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 10px;
        }
        .mw-service-card {
          border-radius: 10px;
          border: 1px solid;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          transition: border-color 0.3s;
        }
        @keyframes cf-border-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(128,216,255,0); }
          50%       { box-shadow: 0 0 8px 1px rgba(128,216,255,0.18); }
        }
        .cf-card-glow {
          animation: cf-border-glow 3s ease-in-out infinite;
          animation-delay: calc(var(--i, 0) * 0.5s);
        }
        .mw-service-icon { font-size: 18px; }
        .mw-service-name { font-size: 8.5px; font-weight: 700; }
        .mw-service-desc { font-size: 7px; }

        /* Doctor row (CareFirst) */
        .mw-doctor-row { display: flex; gap: 8px; margin-bottom: 4px; }
        .mw-doctor-card {
          flex: 1; border-radius: 10px; border: 1px solid;
          padding: 10px 8px; display: flex; flex-direction: column; align-items: center; gap: 5px;
          position: relative;
          overflow: hidden;
        }
        .mw-doctor-photo-wrap {
          position: relative;
          width: 100%;
          height: 70px;
          border-radius: 8px;
          overflow: hidden;
        }
        .mw-doctor-real {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
          display: block;
          border-radius: 8px;
        }
        .mw-doctor-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .mw-doctor-name { font-size: 9px; font-weight: 800; text-align: center; }
        .mw-doctor-spec { font-size: 7.5px; text-align: center; }

        /* Portfolio grid (Lens & Light) */
        .mw-portfolio-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 10px;
        }
        .mw-portfolio-item { display: flex; flex-direction: column; gap: 4px; }
        .mw-portfolio-photo { height: 80px; }
        .ll-photo-frame { border-radius: 6px !important; }
        .ll-photo-frame .mw-photo-real { object-position: center 20%; }
        .ll-photo-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%);
          pointer-events: none;
        }
        .mw-portfolio-cap { font-size: 7.5px; font-weight: 600; text-align: center; }

        /* Packages (Lens & Light) */
        .mw-pkg-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid;
        }
        .mw-pkg-name { font-size: 10px; font-weight: 700; }
        .mw-pkg-desc { font-size: 7px; margin-top: 1px; }
        .mw-pkg-price { font-size: 11px; font-weight: 900; }

        /* Glow CTA buttons */
        @keyframes mw-btn-pulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--glow, rgba(255,255,255,0)); }
          60%       { box-shadow: 0 0 14px 3px var(--glow, rgba(255,255,255,0)); }
        }
        .mw-solid-btn {
          display: inline-flex;
          align-items: center;
          padding: 9px 16px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.3px;
          margin-top: 6px;
          cursor: default;
        }
        .mw-solid-btn.sm { padding: 7px 12px; font-size: 8px; margin-top: 8px; }
        .mw-solid-btn.full {
          width: 100%;
          justify-content: center;
          border-radius: 10px;
          padding: 10px;
        }
        .mw-glow-btn {
          animation: mw-btn-pulse 2.2s ease-in-out infinite;
        }
        .mw-stars { font-size: 13px; letter-spacing: 2px; }

        /* Footer */
        .mw-footer {
          padding: 12px 16px;
          text-align: center;
          font-size: 7px;
          letter-spacing: 0.5px;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .le2-section { height: 700vh; }
          .le2-sticky { height: 100vh; height: 100svh; }
          .le2-phone-bezel { width: 230px; height: 472px; border-radius: 36px; }
          .le2-island { width: 88px; height: 26px; }
          .le2-home-bar { width: 96px; }
          .le2-biz-name { font-size: 40px; letter-spacing: -2px; }
          .le2-intro-title { font-size: 34px; letter-spacing: -1px; }
        }
      `}</style>
    </section>
  )
}
