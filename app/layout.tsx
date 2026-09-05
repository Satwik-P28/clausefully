import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://clausefully.nex3sss.chatgpt.site';

export const metadata: Metadata = {
  title: 'Clausefully — Open-source writing assistant that keeps your voice',
  description:
    'Free local-first writing assistant and Grammarly alternative. Intent locks protect facts and names. Review-first edits, BYOK, no account required.',
  keywords: [
    'open source grammarly alternative',
    'local-first writing assistant',
    'privacy grammar checker',
    'BYOK writing tool',
    'intent-locked editing',
  ],
  authors: [{ name: 'Clausefully contributors' }],
  category: 'productivity',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Clausefully — Make it clearer. Keep it yours.',
    description:
      'Free open-source writing assistant with intent locks and review-first edits.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Clausefully: Make it clearer. Keep it yours.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clausefully — Make it clearer. Keep it yours.',
    description:
      'Free open-source writing assistant with intent locks and review-first edits.',
    images: ['/og.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Clausefully',
  applicationCategory: 'BrowserApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Local-first open-source writing assistant with intent locks and BYOK providers.',
  url: siteUrl,
  downloadUrl: 'https://github.com/Satwik-P28/clausefully',
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
