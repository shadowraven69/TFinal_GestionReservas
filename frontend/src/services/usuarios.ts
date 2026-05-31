import { apiFetch } from './api';
import type { AuthUser } from '@/types/auth';

export interface AdminUsuarioCreate {
  username: string;
  email: string;
  password?: string;
  rol: 'admin' | 'usuario';
}

export interface AdminUsuarioUpdate {
  username?: string;
  email?: string;
  password?: string;
  rol?: 'admin' | 'usuario';
}

export function listarUsuarios(): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>('/usuarios');
}

export function crearUsuario(data: AdminUsuarioCreate): Promise<AuthUser> {
  return apiFetch<AuthUser>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function actualizarUsuario(id: number, data: AdminUsuarioUpdate): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function eliminarUsuario(id: number): Promise<void> {
  return apiFetch<void>(`/usuarios/${id}`, {
    method: 'DELETE',
  });
}
