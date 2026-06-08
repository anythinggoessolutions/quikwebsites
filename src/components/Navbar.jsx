import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { scrollY } = useScroll()
  const shadow = useTransform(scrollY, [0, 60], ['none', '0 2px 20px rgba(0,0,0,0.08)'])
  const bg = useTransform(scrollY, [0, 60], ['rgba(7,5,26,0.72)', 'rgba(255,255,255,0.97)'])
  const logoFilter = useTransform(scrollY, [0, 60], ['brightness(0) invert(1)', 'brightness(1) invert(0)'])
  const linkColor = useTransform(scrollY, [0, 60], ['rgba(255,255,255,0.85)', 'rgba(107,114,128,1)'])

  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  /* Close menu on route change */
  useEffect(() => { setMenuOpen(false) }, [location])

  /* Lock body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/')
      /* Wait for landing page to mount, then scroll */
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  return (
    <>
      <motion.nav style={{ background: bg, boxShadow: shadow }} className="navbar">
        <div className="navbar-inner">
          <motion.div
            className="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          >
            <motion.img
              src="/logo.webp"
              alt="QuikWebsites"
              className="logo-img"
              style={{ filter: logoFilter }}
            />
          </motion.div>

          {/* ── Desktop nav ── */}
          <motion.div
            className="nav-links"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.a onClick={() => scrollToSection('examples')} style={{ color: linkColor }}>Examples</motion.a>
            <motion.a onClick={() => scrollToSection('how-it-works')} style={{ color: linkColor }}>How It Works</motion.a>
            <motion.a onClick={() => scrollToSection('reviews')} style={{ color: linkColor }}>Reviews</motion.a>
            <motion.a className="nav-login" onClick={() => scrollToSection('hero')} style={{ color: linkColor }}>Log In</motion.a>
            <motion.button
              className="nav-cta"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Free &rarr;
            </motion.button>
          </motion.div>

          {/* ── Mobile hamburger ── */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="mobile-menu-inner"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <a onClick={() => scrollToSection('examples')}>Examples</a>
              <a onClick={() => scrollToSection('how-it-works')}>How It Works</a>
              <a onClick={() => scrollToSection('reviews')}>Reviews</a>
              <a onClick={() => scrollToSection('faq')}>FAQ</a>
              <div className="mobile-menu-divider" />
              <a className="mobile-login" onClick={() => scrollToSection('hero')}>Log In</a>
              <button className="mobile-cta" onClick={() => { setMenuOpen(false) }}>
                Start Free &rarr;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          cursor: pointer;
          text-decoration: none;
        }
        .logo-img {
          height: 160px;
          width: auto;
          display: block;
          transition: filter 0.3s;
          margin: -52px -28px;
        }

        /* ── Desktop links ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav-links a {
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #0A0A0A !important; }
        .nav-login {
          opacity: 0.7;
          font-weight: 400 !important;
        }
        .nav-login:hover { opacity: 1; }
        .nav-cta {
          background: #0A0A0A;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.2px;
          transition: background 0.2s;
        }
        .nav-cta:hover { background: #00C65A; }

        /* ── Hamburger (mobile only) ── */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          z-index: 200;
        }
        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: transform 0.3s, opacity 0.3s, background 0.3s;
        }
        .hamburger.open span { background: #fff; }
        .hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ── Mobile overlay ── */
        .mobile-menu {
          position: fixed;
          inset: 0;
          z-index: 99;
          background: rgba(5, 4, 13, 0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mobile-menu-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }
        .mobile-menu-inner a {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          cursor: pointer;
          letter-spacing: -0.3px;
          transition: color 0.2s;
        }
        .mobile-menu-inner a:hover { color: #00C65A; }
        .mobile-menu-divider {
          width: 48px;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 4px 0;
        }
        .mobile-login {
          font-weight: 400 !important;
          font-size: 18px !important;
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .mobile-cta {
          margin-top: 8px;
          background: #00C65A;
          color: #fff;
          border: none;
          padding: 14px 40px;
          border-radius: 50px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: -0.2px;
          transition: background 0.2s, transform 0.15s;
        }
        .mobile-cta:hover { background: #00a84d; }
        .mobile-cta:active { transform: scale(0.97); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .navbar-inner { padding: 0 20px; height: 56px; }
          .logo-img {
            height: 110px;
            margin: -34px -16px;
          }
        }
      `}</style>
    </>
  )
}
