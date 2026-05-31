'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cambiarEstado, listarReservas } from '@/services/reservas';
import type { Reserva, ReservaEstadoUpdate } from '@/types/reserva';

export default function AdminReservasPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReservas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReservas(await listarReservas());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && isAdmin) {
      void loadReservas();
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, authLoading, loadReservas, router]);

  async function handleEstado(id: number, nuevo_estado: ReservaEstadoUpdate['nuevo_estado']) {
    setError(null);
    try {
      await cambiarEstado(id, nuevo_estado);
      await loadReservas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la reserva');
    }
  }

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <main className="page"><p>Redirigiendo...</p></main>;
  }

  return (
    <main className="page grid">
      <section className="card grid">
        <h1>Administrar reservas</h1>
        {error && <div className="error">{error}</div>}
        {loading && <p>Cargando reservas...</p>}
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
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
                <td>{reserva.usuario.username}</td>
                <td>{reserva.espacio.nombre}</td>
                <td>{reserva.fecha}</td>
                <td>{reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}</td>
                <td>{reserva.asistentes}</td>
                <td>{reserva.estado}</td>
                <td>
                  {reserva.estado === 'esperando' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEstado(reserva.id, 'aprobada')} type="button">Aprobar</button>
                      <button className="danger" onClick={() => handleEstado(reserva.id, 'rechazada')} type="button">Rechazar</button>
                    </div>
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
