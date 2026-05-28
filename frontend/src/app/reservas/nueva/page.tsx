'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { listarEspacios } from '@/services/espacios';
import { crearReserva } from '@/services/reservas';
import type { Espacio } from '@/types/espacio';
import type { Reserva, ReservaCreate } from '@/types/reserva';

const initialForm: ReservaCreate = {
  espacio_id: 0,
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  asistentes: 1,
};

export default function NuevaReservaPage() {
  const { isAuthenticated } = useAuth();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [form, setForm] = useState<ReservaCreate>(initialForm);
  const [created, setCreated] = useState<Reserva | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listarEspacios()
      .then((data) => {
        setEspacios(data.filter((espacio) => espacio.estado === 'activo'));
        if (data.length > 0) setForm((current) => ({ ...current, espacio_id: data[0].id }));
      })
      .catch((err: Error) => setError(err.message));
  }, []);

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

  if (!isAuthenticated) {
    return (
      <main className="page">
        <div className="error">Debes iniciar sesión para crear reservas.</div>
      </main>
    );
  }

  return (
    <main className="page grid">
      <section className="card grid">
        <h1>Nueva reserva</h1>
        {error && <div className="error">{error}</div>}
        {created && <div className="success">Reserva #{created.id} creada en estado {created.estado}.</div>}

        <form className="grid" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Espacio
              <select
                value={form.espacio_id}
                onChange={(event) => setForm({ ...form, espacio_id: Number(event.target.value) })}
                required
              >
                {espacios.map((espacio) => (
                  <option key={espacio.id} value={espacio.id}>
                    {espacio.nombre} — capacidad {espacio.capacidad}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha
              <input type="date" value={form.fecha} onChange={(event) => setForm({ ...form, fecha: event.target.value })} required />
            </label>

            <label>
              Hora inicio
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(event) => setForm({ ...form, hora_inicio: event.target.value })}
                required
              />
            </label>

            <label>
              Hora fin
              <input type="time" value={form.hora_fin} onChange={(event) => setForm({ ...form, hora_fin: event.target.value })} required />
            </label>

            <label>
              Asistentes
              <input
                min={1}
                type="number"
                value={form.asistentes}
                onChange={(event) => setForm({ ...form, asistentes: Number(event.target.value) })}
                required
              />
            </label>
          </div>

          <button disabled={loading || espacios.length === 0} type="submit">
            {loading ? 'Creando...' : 'Crear reserva'}
          </button>
        </form>
      </section>
    </main>
  );
}
