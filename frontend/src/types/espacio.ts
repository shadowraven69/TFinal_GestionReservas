export interface Espacio {
  id: number;
  nombre: string;
  capacidad: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | string;
}

export interface EspacioCreate {
  nombre: string;
  capacidad: number;
  estado?: 'activo' | 'inactivo' | 'mantenimiento';
}

export interface EspacioUpdate {
  nombre?: string;
  capacidad?: number;
  estado?: 'activo' | 'inactivo' | 'mantenimiento';
}
