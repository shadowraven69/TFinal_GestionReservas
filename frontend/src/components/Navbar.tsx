'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push('/');
  }

  const publicLinks = (
    <>
      <Link href="/espacios" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
        Espacios
      </Link>
      <Link href="/login" className="btn btn-primary btn-sm">
        Iniciar Sesión
      </Link>
      <Link href="/register" className="btn btn-secondary btn-sm">
        Registrarse
      </Link>
    </>
  );

  const userLinks = (
    <>
      <Link href="/dashboard" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
        Dashboard
      </Link>
      <Link href="/espacios" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
        Espacios
      </Link>
      {isAdmin ? (
        <>
          <Link href="/admin" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
            Admin
          </Link>
          <Link href="/admin/reservas" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
            Reservas
          </Link>
          <Link href="/admin/espacios" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
            Espacios
          </Link>
          <Link href="/usuarios" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
            Usuarios
          </Link>
        </>
      ) : (
        <>
          <Link href="/reservas/nueva" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
            Nueva Reserva
          </Link>
          <Link href="/reservas/mis-reservas" className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">
            Mis Reservas
          </Link>
        </>
      )}
      <span className="text-sm font-medium text-text-muted">{user?.username}</span>
      <button className="btn btn-secondary btn-sm" onClick={handleLogout} type="button">
        Cerrar sesión
      </button>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-surface-card border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-xs font-bold text-white">
            IC
          </div>
          <span className="text-lg font-bold text-text-primary">Reservas IC</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex">
          {isAuthenticated ? userLinks : publicLinks}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
          aria-label="Menú"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col gap-2 border-t border-border bg-surface-card px-4 pb-4 pt-2 sm:hidden">
          {isAuthenticated ? userLinks : publicLinks}
        </div>
      )}
    </nav>
  );
}
