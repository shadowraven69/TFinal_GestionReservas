import './globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Reservas Institucionales',
  description: 'Gestión de reservas de espacios institucionales',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
