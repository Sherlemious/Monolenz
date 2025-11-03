import LandingHeader from '@/app/components/landing/LandingHeader';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <LandingHeader />
      <main>{children}</main>
    </div>
  );
}
