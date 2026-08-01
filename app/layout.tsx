import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import { TopNav } from '@/components/layout/TopNav';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Flight Time Log',
  description: 'Dashboard pencatatan estimasi dan waktu aktual takeoff/landing pesawat',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}>
      <body>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <TopNav />
            <div className="flex-1">{children}</div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
