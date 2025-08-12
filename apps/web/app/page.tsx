import { Header } from '@/components/common/header'
import { HeroSection } from '@/app/(landingpage)/(main)/hero-section'
import { FeaturesSection } from '@/app/(landingpage)/(main)/features-section'
import { IntegrationsSection } from '@/app/(landingpage)/(main)/integrations-section'
import { PricingSection } from '@/app/(landingpage)/(main)/pricing-section'
import { TestimonialsSection } from '@/app/(landingpage)/(main)/testimonials-section'
import { Footer } from '@/components/common/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <IntegrationsSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}