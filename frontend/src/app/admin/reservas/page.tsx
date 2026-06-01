'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cambiarEstado, listarReservas } from '@/services/reservas';
import type { Reserva, ReservaEstadoUpdate } from '@/types/reserva';
import LoadingSpinner from '@/components/LoadingSpinner';

const badgeEstado: Record<string, string> = {
  esperando: 'badge-warning',
  aprobada: 'badge-success',
  rechazada: 'badge-danger',
  cancelada: 'badge-neutral',
};

const labelEstado: Record<string, string> = {
  esperando: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

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
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">Administrar reservas</h1>
        <p className="mt-1 text-text-secondary">Gestioná las solicitudes de reserva</p>
      </div>

      {error && <div className="message-error mb-6">{error}</div>}

      {loading && <LoadingSpinner />}

      {!loading && reservas.length === 0 && (
        <div className="card py-12 text-center">
          <p className="text-text-muted">No hay reservas registradas.</p>
        </div>
      )}

      {!loading && reservas.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="table-wrap">
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
                    <td className="font-medium">{reserva.usuario.username}</td>
                    <td>{reserva.espacio.nombre}</td>
                    <td>{reserva.fecha}</td>
                    <td>
                      {reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}
                    </td>
                    <td>{reserva.asistentes}</td>
                    <td>
                      <span className={`badge ${badgeEstado[reserva.estado] ?? 'badge-neutral'}`}>
                        {labelEstado[reserva.estado] ?? reserva.estado}
                      </span>
                    </td>
                    <td>
                      {reserva.estado === 'esperando' ? (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEstado(reserva.id, 'aprobada')}
                            type="button"
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEstado(reserva.id, 'rechazada')}
                            type="button"
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
