import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'ForensIQ | Digital Forgery Detection',
  description: 'Multi-Modal Digital Forgery Detection System for Images & Documents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-[#0a0a0f] text-slate-200 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-[#1e1e2e] bg-[#0a0a0f] py-6 text-center text-sm text-slate-500">
          <p>Academic Project | MCA Final Year | Digital Forensics</p>
        </footer>
      </body>
    </html>
  );
}
