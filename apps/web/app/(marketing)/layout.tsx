export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className='grid-pattern' />
      <main>{children}</main>
    </div>
  );
}
