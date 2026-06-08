import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import IntroAnimation from './components/IntroAnimation'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import HowItWorks from './sections/HowItWorks'
import LiveExamples from './sections/LiveExamples'
import Comparison from './sections/Comparison'
import BusinessNeeds from './sections/BusinessNeeds'
import Reviews from './sections/Reviews'
import CallToAction from './sections/CallToAction'
import FAQ from './sections/FAQ'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ContactSupport from './pages/ContactSupport'

function LandingPage() {
  return (
    <>
      <IntroAnimation />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <LiveExamples />
        <Comparison />
        <BusinessNeeds />
        <Reviews />
        <CallToAction />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactSupport />} />
      </Routes>
    </BrowserRouter>
  )
}
