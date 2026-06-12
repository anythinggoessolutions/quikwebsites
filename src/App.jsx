import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import posthog from 'posthog-js'
import { AuthProvider } from './lib/useAuth.jsx'
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
import GeneratePage from './pages/GeneratePage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import SiteViewPage from './pages/SiteViewPage'
import EditorPage from './pages/EditorPage'
import PricingPage from './pages/PricingPage'

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
  useEffect(() => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
      posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
        api_host: 'https://us.i.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
      })
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sites/:id" element={<SiteViewPage />} />
          <Route path="/sites/:id/edit" element={<EditorPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactSupport />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
