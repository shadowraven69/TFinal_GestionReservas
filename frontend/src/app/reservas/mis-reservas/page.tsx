'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cancelarReserva, listarMisReservas } from '@/services/reservas';
import type { Reserva } from '@/types/reserva';

export default function MisReservasPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  async function loadReservas() {
    setLoading(true);
    setError(null);
    try {
      setReservas(await listarMisReservas());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus reservas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) void loadReservas();
  }, [isAuthenticated]);

  async function handleCancel(id: number) {
    setError(null);
    try {
      await cancelarReserva(id);
      await loadReservas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la reserva');
    }
  }

  if (authLoading || !isAuthenticated) {
    return <main className="page"><p>Redirigiendo...</p></main>;
  }

  return (
    <main className="page grid">
      <section className="card grid">
        <h1>Mis reservas</h1>
        {error && <div className="error">{error}</div>}
        {loading && <p>Cargando reservas...</p>}
        <table>
          <thead>
            <tr>
              <th>Espacio</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Asistentes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.espacio.nombre}</td>
                <td>{reserva.fecha}</td>
                <td>{reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}</td>
                <td>{reserva.asistentes}</td>
                <td>{reserva.estado}</td>
                <td>
                  {reserva.estado === 'esperando' ? (
                    <button className="danger" onClick={() => handleCancel(reserva.id)} type="button">
                      Cancelar
                    </button>
                  ) : (
                    'Sin acciones'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
