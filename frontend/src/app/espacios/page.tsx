'use client';

import { useEffect, useState } from 'react';
import { getDisponibilidad, listarEspacios } from '@/services/espacios';
import type { DisponibilidadSlot, Espacio } from '@/types/espacio';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function EspaciosPage() {
  const { isAuthenticated } = useAuth();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalEspacio, setModalEspacio] = useState<Espacio | null>(null);
  const [modalFecha, setModalFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<DisponibilidadSlot[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const all = await listarEspacios();
        setEspacios(all.filter((e) => e.estado === 'activo'));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los espacios');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function abrirDisponibilidad(espacio: Espacio) {
    setModalEspacio(espacio);
    setModalFecha(new Date().toISOString().slice(0, 10));
    setSlots([]);
    setModalLoading(true);
    try {
      const data = await getDisponibilidad(espacio.id, new Date().toISOString().slice(0, 10));
      setSlots(data);
    } catch {
      setError('No se pudo cargar la disponibilidad');
    } finally {
      setModalLoading(false);
    }
  }

  async function cambiarFecha(fecha: string) {
    if (!modalEspacio) return;
    setModalFecha(fecha);
    setModalLoading(true);
    try {
      const data = await getDisponibilidad(modalEspacio.id, fecha);
      setSlots(data);
    } catch {
      setError('No se pudo cargar la disponibilidad');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">Espacios</h1>
        <p className="mt-1 text-text-secondary">
          Explorá los espacios disponibles y consultá su disponibilidad
        </p>
      </div>

      {error && <div className="message-error mb-6">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary-600" />
        </div>
      )}

      {!loading && espacios.length === 0 && (
        <div className="card py-12 text-center">
          <p className="text-text-muted">No hay espacios disponibles en este momento.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {espacios.map((espacio) => (
          <div key={espacio.id} className="card flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <span className={`badge ${espacio.estado === 'activo' ? 'badge-success' : 'badge-neutral'}`}>
                {espacio.estado === 'activo' ? 'Disponible' : espacio.estado}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-text-primary">{espacio.nombre}</h3>

            <div className="mt-2 flex flex-col gap-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {espacio.ubicacion}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Capacidad: {espacio.capacidad} personas
              </span>
            </div>

            <div className="mt-auto pt-4 flex gap-2">
              <button
                className="btn btn-primary btn-sm flex-1"
                onClick={() => abrirDisponibilidad(espacio)}
                type="button"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Ver disponibilidad
              </button>
              {isAuthenticated && (
                <Link
                  href={`/reservas/nueva?espacio_id=${espacio.id}`}
                  className="btn btn-secondary btn-sm"
                >
                  Reservar
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Availability Modal */}
      {modalEspacio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setModalEspacio(null)}
        >
          <div
            className="card w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{modalEspacio.nombre}</h2>
                <p className="text-sm text-text-secondary">
                  {modalEspacio.ubicacion} &middot; Cap. {modalEspacio.capacidad}
                </p>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover"
                onClick={() => setModalEspacio(null)}
                type="button"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Date selector */}
            <label className="input-label mb-4">
              Seleccioná una fecha
              <input
                className="input"
                type="date"
                value={modalFecha}
                onChange={(e) => cambiarFecha(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </label>

            {/* Slots grid */}
            {modalLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary-600" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-[#dcfce7]" />
                    Libre
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-[#fee2e2]" />
                    Ocupado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-[#fef9c3]" />
                    Mantenimiento
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot) => {
                    const colors: Record<string, string> = {
                      libre: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
                      ocupado: 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]',
                      mantenimiento: 'bg-[#fef9c3] text-[#854d0e] border-[#fef08a]',
                    };
                    return (
                      <div
                        key={slot.hora_inicio}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm font-medium ${colors[slot.estado] ?? colors.libre}`}
                      >
                        <span>
                          {slot.hora_inicio.slice(0, 5)} - {slot.hora_fin.slice(0, 5)}
                        </span>
                        <span className="text-xs capitalize">{slot.estado}</span>
                      </div>
                    );
                  })}
                </div>

                {slots.length === 0 && (
                  <p className="py-6 text-center text-sm text-text-muted">
                    No hay horarios disponibles para esta fecha.
                  </p>
                )}
              </>
            )}

            {/* Reserve CTA */}
            {isAuthenticated && (
              <Link
                href={`/reservas/nueva?espacio_id=${modalEspacio.id}&fecha=${modalFecha}`}
                className="btn btn-primary mt-4 w-full justify-center"
              >
                Reservar este espacio
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
