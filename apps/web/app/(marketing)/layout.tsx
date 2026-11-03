import LandingHeader from '@/app/components/landing/LandingHeader';
import LandingFooter from '@/app/components/landing/LandingFooter';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='relative min-h-screen'>
      <div className='grid-pattern' />
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
