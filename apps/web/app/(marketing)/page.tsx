import { Metadata } from 'next';
import HeroSection from '@/app/components/landing/Hero';

export const metadata: Metadata = {
  title: "Build Your Career's Master Profile | Monolenz",
  description:
    'Create one master profile and generate unlimited tailored resumes, dynamic portfolios, and track all your job applications. 95% ATS pass rate with 100+ professional templates.',
  openGraph: {
    title: "Build Your Career's Master Profile | Monolenz",
    description:
      'Create one master profile and generate unlimited tailored resumes, dynamic portfolios, and track all your job applications.',
  },
  twitter: {
    title: "Build Your Career's Master Profile | Monolenz",
    description:
      'Create one master profile and generate unlimited tailored resumes, dynamic portfolios, and track all your job applications.',
  },
};

export default async function Page() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
