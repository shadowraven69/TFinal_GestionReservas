export type ReservaEstado = 'esperando' | 'aprobada' | 'rechazada' | 'cancelada';

export interface ReservaUsuario {
  id: number;
  username: string;
  email: string;
  rol: 'admin' | 'usuario' | string;
}

export interface ReservaEspacio {
  id: number;
  nombre: string;
  capacidad: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | string;
}

export interface Reserva {
  id: number;
  usuario_id: number;
  espacio_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: ReservaEstado;
  asistentes: number;
  created_at: string;
  updated_at: string;
  usuario: ReservaUsuario;
  espacio: ReservaEspacio;
}

export interface ReservaCreate {
  espacio_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  asistentes: number;
}

export interface ReservaEstadoUpdate {
  nuevo_estado: Extract<ReservaEstado, 'aprobada' | 'rechazada'>;
}
