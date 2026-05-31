export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) return body.detail.map((item: { msg?: string }) => item.msg ?? JSON.stringify(item)).join(', ');
    return JSON.stringify(body.detail ?? body);
  } catch {
    return `Error HTTP ${response.status}`;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    // Si el token es invǭlido o expir, limpiamos la sesin y forzamos re-login
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesin expirada. Por favor, inicia sesin nuevamente.');
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json() as Promise<T>;
}
