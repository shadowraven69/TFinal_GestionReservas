import './globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Reservas Institucionales',
  description: 'Gestión de reservas de espacios institucionales',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="page">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
