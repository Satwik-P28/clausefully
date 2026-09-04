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

export const metadata: Metadata = {
  title: 'GentleEdit — Polish the writing. Keep the person.',
  description:
    'A local-first, review-first writing assistant that protects your meaning, facts, and voice.',
  metadataBase: new URL('https://gentleedit.pages.dev'),
  openGraph: {
    title: 'GentleEdit — Polish the writing. Keep the person.',
    description:
      'Intent-locked, review-first writing with your own AI provider.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'GentleEdit: Polish the writing. Keep the person.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GentleEdit — Polish the writing. Keep the person.',
    description:
      'Intent-locked, review-first writing with your own AI provider.',
    images: ['/og.png'],
  },
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
        {children}
      </body>
    </html>
  );
}
