export interface AuthUser {
  id: number;
  username: string;
  email: string;
  rol: 'admin' | 'usuario' | string;
}
