import HeroSection from '@/app/components/landing/Hero';
import HowItWorks from '@/app/components/landing/HowItWorks';
import FeaturesSection from '@/app/components/landing/Features';
import PricingSection from '@/app/components/landing/Pricing';
import FAQ from '@/app/components/landing/FAQ';
import FinalCTA from '@/app/components/landing/FinalCTA';

export default function Page() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />
      <FAQ />
      <FinalCTA />
    </>
  );
}
