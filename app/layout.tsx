import type {Metadata} from 'next';
import { Orbitron, Inter, Michroma } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

const michroma = Michroma({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-michroma',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Quantum Courier Horizon',
  description: 'Space Delivery Management Game',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable} ${michroma.variable}`}>
      <body suppressHydrationWarning className="bg-black text-white font-sans overflow-hidden">{children}</body>
    </html>
  );
}
