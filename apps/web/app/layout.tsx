import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Header from '@/app/components/Header';
import { PostHogProvider } from '@/app/providers/PostHogProvider';
import { Suspense } from 'react';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Monolenz',
  description: 'Monolenz',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={montserrat.variable}>
        <Suspense fallback={null}>
          <PostHogProvider>
            <Header />
            {children}
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
