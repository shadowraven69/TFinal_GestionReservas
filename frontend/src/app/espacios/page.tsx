'use client';

import { useEffect, useState } from 'react';
import { listarEspacios } from '@/services/espacios';
import type { Espacio } from '@/types/espacio';

export default function EspaciosPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="page grid">
      <section className="card grid">
        <h1>Espacios Disponibles</h1>
        {loading && <p>Cargando espacios...</p>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && espacios.length === 0 && (
          <p>No hay espacios disponibles.</p>
        )}
        <div
          className="card-grid"
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}
        >
          {espacios.map((espacio) => (
            <div key={espacio.id} className="card">
              <h3>{espacio.nombre}</h3>
              <p>Capacidad: {espacio.capacidad} personas</p>
              <span className={`badge badge--${espacio.estado}`}>
                {espacio.estado === 'activo' ? 'Disponible' : espacio.estado}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
