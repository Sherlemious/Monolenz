import HeroSection from '@/app/components/landing/Hero';
import FeaturesSection from '@/app/components/landing/Features';
import PricingSection from '@/app/components/landing/Pricing';

export default async function Page() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </main>
  );
}
