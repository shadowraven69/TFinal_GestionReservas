import { apiFetch } from './api';
import type { Espacio } from '@/types/espacio';

export function listarEspacios(): Promise<Espacio[]> {
  return apiFetch<Espacio[]>('/espacios');
}
