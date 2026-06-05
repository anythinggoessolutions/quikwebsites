import { motion, useScroll, useTransform } from 'framer-motion'

export default function Navbar() {
  const { scrollY } = useScroll()
  const shadow = useTransform(scrollY, [0, 60], ['none', '0 2px 20px rgba(0,0,0,0.08)'])
  const bg = useTransform(scrollY, [0, 60], ['rgba(7,5,26,0.72)', 'rgba(255,255,255,0.97)'])
  // Logo is dark — invert to white on the dark hero, back to normal once navbar fills in
  const logoFilter = useTransform(scrollY, [0, 60], ['brightness(0) invert(1)', 'brightness(1) invert(0)'])
  const linkColor = useTransform(scrollY, [0, 60], ['rgba(255,255,255,0.85)', 'rgba(107,114,128,1)'])

  return (
    <motion.nav style={{ background: bg, boxShadow: shadow }} className="navbar">
      <div className="navbar-inner">
        <motion.div
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.img
            src="/logo.png"
            alt="QuikWebsites"
            className="logo-img"
            style={{ filter: logoFilter }}
          />
        </motion.div>

        <motion.div
          className="nav-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.a href="#expect" style={{ color: linkColor }}>Features</motion.a>
          <motion.a href="#process" style={{ color: linkColor }}>Process</motion.a>
          <motion.a href="#reviews" style={{ color: linkColor }}>Reviews</motion.a>
          <motion.button
            className="nav-cta"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Start Free →
          </motion.button>
        </motion.div>
      </div>

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
          /* aggressively pull in transparent padding on all sides */
          margin: -52px -28px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
        }
        .nav-links a {
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #0A0A0A !important; }
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
        @media (max-width: 640px) {
          .nav-links a { display: none; }
          .navbar-inner { padding: 0 20px; height: 56px; }
          .logo-img {
            height: 110px;
            margin: -34px -16px; /* crop transparent padding while keeping mark visible */
          }
        }
      `}</style>
    </motion.nav>
  )
}
