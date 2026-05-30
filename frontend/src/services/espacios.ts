import { apiFetch } from './api';
import type { Espacio, EspacioCreate, EspacioUpdate } from '@/types/espacio';

export function listarEspacios(): Promise<Espacio[]> {
  return apiFetch<Espacio[]>('/espacios');
}

export function crearEspacio(data: EspacioCreate): Promise<Espacio> {
  return apiFetch<Espacio>('/espacios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function actualizarEspacio(id: number, data: EspacioUpdate): Promise<Espacio> {
  return apiFetch<Espacio>(`/espacios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
