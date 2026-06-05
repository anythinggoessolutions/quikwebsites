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

export default function App() {
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
