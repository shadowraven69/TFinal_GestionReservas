'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { crearUsuario, listarUsuarios, actualizarUsuario, eliminarUsuario, type AdminUsuarioCreate, type AdminUsuarioUpdate } from '@/services/usuarios';
import type { AuthUser } from '@/types/auth';

const initialForm: AdminUsuarioCreate = {
  username: '',
  email: '',
  password: '',
  rol: 'usuario',
};

interface EditingState {
  id: number;
  username: string;
  email: string;
  password?: string;
  rol: 'admin' | 'usuario';
}

export default function UsuariosPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, loading: authLoading, user } = useAuth();
  const [usuarios, setUsuarios] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AdminUsuarioCreate>(initialForm);
  const [creating, setCreating] = useState(false);
  
  const [editing, setEditing] = useState<EditingState | null>(null);

  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsuarios(await listarUsuarios());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && isAdmin) {
      void loadUsuarios();
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, authLoading, loadUsuarios, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password?.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await crearUsuario(form);
      setForm(initialForm);
      await loadUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id: number) {
    if (!editing || editing.id !== id) return;
    setError(null);
    try {
      const data: AdminUsuarioUpdate = {};
      if (editing.username.trim()) data.username = editing.username.trim();
      if (editing.email.trim()) data.email = editing.email.trim();
      if (editing.password?.trim()) data.password = editing.password.trim();
      data.rol = editing.rol;
      
      await actualizarUsuario(id, data);
      setEditing(null);
      await loadUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setError(null);
    try {
      await eliminarUsuario(id);
      await loadUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario');
    }
  }

  function startEdit(usuario: AuthUser) {
    setEditing({ id: usuario.id, username: usuario.username, email: usuario.email, rol: usuario.rol as 'admin' | 'usuario', password: '' });
  }

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <main className="page"><p>Redirigiendo...</p></main>;
  }

  return (
    <main className="page grid">
      <section className="card grid">
        <h1>Administrar Usuarios</h1>

        {error && <div className="error">{error}</div>}
        {loading && <p>Cargando usuarios...</p>}

        <form
          onSubmit={handleCreate}
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'end', flexWrap: 'wrap' }}
        >
          <div>
            <label htmlFor="nuevo-username">Usuario</label>
            <input
              id="nuevo-username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Ej. juanperez"
              required
              minLength={3}
              maxLength={80}
            />
          </div>
          <div>
            <label htmlFor="nuevo-email">Email</label>
            <input
              id="nuevo-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="juan@ejemplo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="nuevo-password">Contraseña</label>
            <input
              id="nuevo-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 caracteres"
              required
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="nuevo-rol">Rol</label>
            <select
              id="nuevo-rol"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value as 'admin' | 'usuario' })}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={creating}>
            {creating ? 'Creando...' : 'Crear Usuario'}
          </button>
        </form>

        {!loading && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay usuarios registrados.</td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    {editing?.id === usuario.id ? (
                      <>
                        <td>{usuario.id}</td>
                        <td>
                          <input
                            value={editing.username}
                            onChange={(e) => setEditing({ ...editing, username: e.target.value })}
                            minLength={3}
                            maxLength={80}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            value={editing.email}
                            onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                            required
                          />
                        </td>
                        <td>
                          <select
                            value={editing.rol}
                            onChange={(e) => setEditing({ ...editing, rol: e.target.value as 'admin' | 'usuario' })}
                          >
                            <option value="usuario">Usuario</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                            <input
                              type="password"
                              value={editing.password}
                              onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                              placeholder="Nueva clave (opcional)"
                              minLength={6}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleUpdate(usuario.id)} type="button">Guardar</button>
                              <button className="danger" onClick={() => setEditing(null)} type="button">Cancelar</button>
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{usuario.id}</td>
                        <td>{usuario.username}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.rol}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => startEdit(usuario)} type="button">Editar</button>
                            {user?.id !== usuario.id && (
                              <button className="danger" onClick={() => handleDelete(usuario.id)} type="button">Eliminar</button>
                            )}
                          </div>
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
