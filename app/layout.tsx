import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { RuntimeEventGuard } from '@/components/RuntimeEventGuard';

const exo2 = localFont({
  src: '../public/fonts/Exo2-Variable.ttf',
  weight: '100 900',
  display: 'swap',
  variable: '--font-orbitron',
});

const audiowide = localFont({
  src: '../public/fonts/Audiowide-Regular.ttf',
  weight: '400',
  display: 'swap',
  variable: '--font-title',
});

const inter = localFont({
  src: '../public/fonts/Inter-Variable.ttf',
  weight: '100 900',
  display: 'swap',
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
        <RuntimeEventGuard />
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}

