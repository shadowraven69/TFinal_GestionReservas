'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { listarEspacios } from '@/services/espacios';
import { crearReserva } from '@/services/reservas';
import type { Espacio } from '@/types/espacio';
import type { Reserva, ReservaCreate } from '@/types/reserva';
import LoadingSpinner from '@/components/LoadingSpinner';

const initialForm: ReservaCreate = {
  espacio_id: 0,
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  asistentes: 1,
};

function NuevaReservaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [form, setForm] = useState<ReservaCreate>(() => ({
    ...initialForm,
    espacio_id: Number(searchParams.get('espacio_id')) || 0,
    fecha: searchParams.get('fecha') || '',
  }));
  const [created, setCreated] = useState<Reserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    listarEspacios()
      .then((data) => {
        const activos = data.filter((e) => e.estado === 'activo');
        setEspacios(activos);
        if (form.espacio_id === 0 && activos.length > 0) {
          setForm((current) => ({ ...current, espacio_id: activos[0].id }));
        }
      })
      .catch((err: Error) => setError(err.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCreated(null);
    try {
      const reserva = await crearReserva(form);
      setCreated(reserva);
      setForm((current) => ({ ...initialForm, espacio_id: current.espacio_id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la reserva');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-text-primary">Nueva reserva</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Completá los datos para crear una solicitud de reserva
      </p>

      {error && <div className="message-error mt-4">{error}</div>}
      {created && (
        <div className="message-success mt-4">
          Reserva #{created.id} creada — estado: <strong>{created.estado}</strong>.
          {created.estado === 'esperando' && ' Queda pendiente de aprobación.'}
        </div>
      )}

      <div className="card mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="input-label">
            Espacio
            <select
              className="input"
              value={form.espacio_id}
              onChange={(e) => setForm({ ...form, espacio_id: Number(e.target.value) })}
              required
            >
              <option value={0} disabled>
                Seleccioná un espacio
              </option>
              {espacios.map((espacio) => (
                <option key={espacio.id} value={espacio.id}>
                  {espacio.nombre} — Cap. {espacio.capacidad} ({espacio.ubicacion})
                </option>
              ))}
            </select>
          </label>

          <label className="input-label">
            Fecha
            <input
              className="input"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              min={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="input-label">
              Hora inicio
              <input
                className="input"
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                required
              />
            </label>
            <label className="input-label">
              Hora fin
              <input
                className="input"
                type="time"
                value={form.hora_fin}
                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                required
              />
            </label>
          </div>

          <label className="input-label">
            Asistentes
            <input
              className="input"
              type="number"
              min={1}
              value={form.asistentes}
              onChange={(e) => setForm({ ...form, asistentes: Number(e.target.value) })}
              required
            />
          </label>

          <button
            className="btn btn-primary w-full justify-center"
            disabled={loading || espacios.length === 0}
            type="submit"
          >
            {loading ? 'Creando...' : 'Solicitar reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NuevaReservaPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NuevaReservaForm />
    </Suspense>
  );
}
