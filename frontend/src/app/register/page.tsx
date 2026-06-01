'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await register(username, email, password);
      setSuccess('Registro exitoso. Redirigiendo al inicio de sesión...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
            IC
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-primary">Crear cuenta</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Registrate para empezar a reservar espacios
          </p>
        </div>

        <div className="card">
          {error && <div className="message-error mb-4">{error}</div>}
          {success && <div className="message-success mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="input-label">
              Usuario
              <input
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                required
                minLength={3}
                maxLength={80}
              />
            </label>

            <label className="input-label">
              Email
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </label>

            <label className="input-label">
              Contraseña
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </label>

            <button className="btn btn-primary w-full justify-center" disabled={loading} type="submit">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-text-secondary">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
