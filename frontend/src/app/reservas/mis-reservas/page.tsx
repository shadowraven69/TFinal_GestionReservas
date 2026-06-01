'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cancelarReserva, listarMisReservas } from '@/services/reservas';
import type { Reserva } from '@/types/reserva';
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
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

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
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">Mis reservas</h1>
        <p className="mt-1 text-text-secondary">
          Todas tus solicitudes de reserva
        </p>
      </div>

      {error && <div className="message-error mb-6">{error}</div>}

      {loading && <LoadingSpinner />}

      {!loading && reservas.length === 0 && (
        <div className="card py-12 text-center">
          <p className="text-text-muted">No tenés reservas registradas.</p>
        </div>
      )}

      {!loading && reservas.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="table-wrap">
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
                    <td className="font-medium">{reserva.espacio.nombre}</td>
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
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(reserva.id)}
                          type="button"
                        >
                          Cancelar
                        </button>
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
