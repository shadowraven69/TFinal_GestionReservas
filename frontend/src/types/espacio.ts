export interface Espacio {
  id: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | string;
}

export interface EspacioCreate {
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado?: 'activo' | 'inactivo' | 'mantenimiento';
}

export interface EspacioUpdate {
  nombre?: string;
  ubicacion?: string;
  capacidad?: number;
  estado?: 'activo' | 'inactivo' | 'mantenimiento';
}
