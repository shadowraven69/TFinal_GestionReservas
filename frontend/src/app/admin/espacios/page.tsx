'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { actualizarEspacio, crearEspacio, listarEspacios } from '@/services/espacios';
import type { Espacio, EspacioCreate, EspacioUpdate } from '@/types/espacio';

interface EditingState {
  id: number;
  nombre: string;
  capacidad: number;
}

export default function AdminEspaciosPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New-space form
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCapacidad, setNuevaCapacidad] = useState('');
  const [creating, setCreating] = useState(false);

  // Editing state
  const [editing, setEditing] = useState<EditingState | null>(null);

  const loadEspacios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEspacios(await listarEspacios());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los espacios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) void loadEspacios();
  }, [isAuthenticated, isAdmin, loadEspacios]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevaCapacidad) return;
    setCreating(true);
    setError(null);
    try {
      await crearEspacio({
        nombre: nuevoNombre.trim(),
        capacidad: Number(nuevaCapacidad),
      } satisfies EspacioCreate);
      setNuevoNombre('');
      setNuevaCapacidad('');
      await loadEspacios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el espacio');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id: number) {
    if (!editing || editing.id !== id) return;
    setError(null);
    try {
      const data: EspacioUpdate = {};
      if (editing.nombre.trim()) data.nombre = editing.nombre.trim();
      if (editing.capacidad > 0) data.capacidad = editing.capacidad;
      await actualizarEspacio(id, data);
      setEditing(null);
      await loadEspacios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el espacio');
    }
  }

  const estadoSiguiente: Record<string, 'activo' | 'inactivo' | 'mantenimiento'> = {
    activo: 'inactivo',
    inactivo: 'mantenimiento',
    mantenimiento: 'activo',
  };

  const etiquetaEstado: Record<string, string> = {
    activo: 'Desactivar',
    inactivo: 'Mantenimiento',
    mantenimiento: 'Activar',
  };

  async function handleToggleEstado(espacio: Espacio) {
    setError(null);
    try {
      await actualizarEspacio(espacio.id, { estado: estadoSiguiente[espacio.estado] ?? 'activo' } satisfies EspacioUpdate);
      await loadEspacios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado');
    }
  }

  function startEdit(espacio: Espacio) {
    setEditing({ id: espacio.id, nombre: espacio.nombre, capacidad: espacio.capacidad });
  }

  function cancelEdit() {
    setEditing(null);
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="page">
        <div className="error">Solo un administrador puede acceder al panel de espacios.</div>
      </main>
    );
  }

  return (
    <main className="page grid">
      <section className="card grid">
        <h1>Administrar espacios</h1>

        {error && <div className="error">{error}</div>}
        {loading && <p>Cargando espacios...</p>}

        {/* Inline create form */}
        <form
          onSubmit={handleCreate}
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'end' }}
        >
          <div>
            <label htmlFor="nuevo-nombre">Nuevo espacio</label>
            <input
              id="nuevo-nombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre"
              required
              minLength={3}
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="nueva-capacidad">Capacidad</label>
            <input
              id="nueva-capacidad"
              type="number"
              value={nuevaCapacidad}
              onChange={(e) => setNuevaCapacidad(e.target.value)}
              placeholder="Capacidad"
              required
              min={1}
            />
          </div>
          <button type="submit" disabled={creating}>
            {creating ? 'Creando...' : 'Nuevo Espacio'}
          </button>
        </form>

        {/* Table */}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {espacios.length === 0 ? (
                <tr>
                  <td colSpan={4}>No hay espacios registrados.</td>
                </tr>
              ) : (
                espacios.map((espacio) => (
                  <tr key={espacio.id}>
                    {editing?.id === espacio.id ? (
                      <>
                        <td>
                          <input
                            value={editing.nombre}
                            onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
              minLength={1}
                            maxLength={120}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editing.capacidad}
                            onChange={(e) => setEditing({ ...editing, capacidad: Number(e.target.value) })}
                            min={1}
                          />
                        </td>
                        <td>{espacio.estado}</td>
                        <td>
                          <button onClick={() => handleUpdate(espacio.id)} type="button">
                            Guardar
                          </button>
                          <button className="danger" onClick={cancelEdit} type="button">
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{espacio.nombre}</td>
                        <td>{espacio.capacidad}</td>
                        <td>{espacio.estado}</td>
                        <td>
                          <button onClick={() => startEdit(espacio)} type="button">
                            Editar
                          </button>
                          <button onClick={() => handleToggleEstado(espacio)} type="button">
                            {etiquetaEstado[espacio.estado] ?? 'Cambiar Estado'}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
