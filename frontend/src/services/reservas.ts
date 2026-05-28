import { apiFetch } from './api';
import type { Reserva, ReservaCreate, ReservaEstadoUpdate } from '@/types/reserva';

export function crearReserva(data: ReservaCreate): Promise<Reserva> {
  return apiFetch<Reserva>('/reservas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function listarReservas(): Promise<Reserva[]> {
  return apiFetch<Reserva[]>('/reservas');
}

export function listarMisReservas(): Promise<Reserva[]> {
  return apiFetch<Reserva[]>('/reservas/mis-reservas');
}

export function cambiarEstado(id: number, nuevo_estado: ReservaEstadoUpdate['nuevo_estado']): Promise<Reserva> {
  return apiFetch<Reserva>(`/reservas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ nuevo_estado }),
  });
}

export function cancelarReserva(id: number): Promise<Reserva> {
  return apiFetch<Reserva>(`/reservas/${id}/cancelar`, {
    method: 'PUT',
  });
}
