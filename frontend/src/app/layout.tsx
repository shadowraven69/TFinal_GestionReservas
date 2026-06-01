import './globals.css';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

export const metadata = {
  title: 'Reservas IC',
  description: 'Gestión de reservas de espacios institucionales',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={plusJakartaSans.variable}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
