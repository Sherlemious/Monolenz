import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/app/components/Header';

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
        <Header />
        {children}
        
        {/* Tally Form Script */}
        <Script
          src="https://tally.so/widgets/embed.js"
          strategy="afterInteractive"
        />
        <Script id="tally-config" strategy="afterInteractive">
          {`
            window.TallyConfig = {
              "formId": "n09QLZ",
              "popup": {
                "autoClose": 2000,
                "formEventsForwarding": true,
                "open": {
                  "trigger": "scroll",
                  "scrollPercent": 10
                },
                "alignLeft": true
              }
            };
          `}
        </Script>
      </body>
    </html>
  );
}
