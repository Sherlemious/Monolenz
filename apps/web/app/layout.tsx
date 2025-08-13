import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/app/components/Header';
import { GoogleAnalytics } from '@/app/components/GoogleAnalytics';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: "Monolenz - Your Career's Source of Truth",
    template: '%s | Monolenz',
  },
  description:
    'Stop managing scattered documents. Build your master profile once, then generate tailored resumes, portfolios, and track applications. One profile, infinite possibilities.',
  keywords: [
    'resume builder',
    'portfolio generator',
    'job application tracker',
    'career management',
    'professional profile',
    'resume templates',
    'ATS-friendly resumes',
    'dynamic portfolio',
    'job search tools',
    'career development',
  ],
  authors: [{ name: 'Monolenz' }],
  creator: 'Monolenz',
  publisher: 'Monolenz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.monolenz.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Monolenz - Your Career's Source of Truth",
    description:
      'Stop managing scattered documents. Build your master profile once, then generate tailored resumes, portfolios, and track applications.',
    url: 'https://www.monolenz.com',
    siteName: 'Monolenz',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Monolenz - Your Career's Source of Truth",
    description: 'Build your master profile once, then generate tailored resumes, portfolios, and track applications.',
    creator: '@monolenz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Monolenz',
    description:
      'Professional career management platform for building resumes, portfolios, and tracking job applications',
    url: 'https://www.monolenz.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      category: 'SaaS',
    },
    featureList: [
      'Dynamic Resume Generation',
      'Portfolio Builder',
      'Application Tracking',
      'ATS-Friendly Templates',
      'Real-time Analytics',
    ],
  };

  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#111827' />
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className={montserrat.variable}>
        <Header />
        {children}

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy='afterInteractive'
            />
            <Script id='google-analytics' strategy='afterInteractive'>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
            <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID} />
          </>
        )}

        {/* Tally Form Script */}
        <Script src='https://tally.so/widgets/embed.js' strategy='afterInteractive' />
        <Script id='tally-config' strategy='afterInteractive'>
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
