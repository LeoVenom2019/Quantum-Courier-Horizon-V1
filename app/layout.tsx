import type { Metadata } from 'next';
import { Exo_2, Inter, Audiowide } from 'next/font/google';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-orbitron',
});

const audiowide = Audiowide({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-title',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Quantum Courier Horizon',
  description: 'Space Delivery Management Game',
};

import { GameProvider } from '@/lib/game-state';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${exo2.variable} ${inter.variable} ${audiowide.variable}`}>
      <body suppressHydrationWarning className="bg-black text-white font-sans overflow-hidden">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
