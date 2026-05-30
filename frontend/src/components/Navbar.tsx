'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Reservas
      </Link>
      <div className="navbar-links">
        <Link href="/">Inicio</Link>
        {isAuthenticated ? (
          <>
            {isAdmin ? (
              <>
                <Link href="/admin/reservas">Reservas</Link>
                <Link href="/usuarios">Usuarios</Link>
              </>
            ) : (
              <>
                <Link href="/reservas/nueva">Nueva Reserva</Link>
                <Link href="/reservas/mis-reservas">Mis Reservas</Link>
              </>
            )}
            <span className="navbar-user">{user?.username}</span>
            <button className="navbar-logout" onClick={handleLogout} type="button">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Iniciar Sesión</Link>
            <Link href="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
