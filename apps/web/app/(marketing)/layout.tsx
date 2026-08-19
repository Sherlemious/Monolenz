import LandingHeader from '@/app/components/landing/LandingHeader';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className='grid-pattern' />
      <LandingHeader />
      <main>{children}</main>
    </div>
  );
}
