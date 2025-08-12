import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/app/(landingpage)/(main)/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UptimeMatrix - Monitor everything. Break nothing. Fix instantly.',
  description: 'Comprehensive monitoring for your entire infrastructure. Get instant alerts, detailed analytics, and automated incident response to keep your services running 24/7.',
  keywords: 'monitoring, uptime, infrastructure, incident management, status pages, alerts, DevOps, SRE',
  authors: [{ name: 'UptimeMatrix' }],
  creator: 'UptimeMatrix',
  publisher: 'UptimeMatrix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://uptimematrix.com'),
  openGraph: {
    title: 'UptimeMatrix - Monitor everything. Break nothing. Fix instantly.',
    description: 'Comprehensive monitoring for your entire infrastructure with instant alerts and automated incident response.',
    url: 'https://uptimematrix.com',
    siteName: 'UptimeMatrix',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UptimeMatrix - Infrastructure Monitoring Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UptimeMatrix - Monitor everything. Break nothing. Fix instantly.',
    description: 'Comprehensive monitoring for your entire infrastructure with instant alerts and automated incident response.',
    creator: '@uptimematrix',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}