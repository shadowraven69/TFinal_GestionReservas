import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      setToken(storedToken);
      // Aquí podríamos hacer una llamada al backend para obtener los datos del usuario
      // Por ahora, simulamos que tenemos un usuario basado en el token
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({
          email: payload.sub,
          rol: payload.rol || 'usuario', // Asumimos que el token tiene el rol
          activo: true
        });
      } catch (e) {
        console.error('Error al decodificar el token:', e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Component 
      {...pageProps} 
      token={token} 
      user={user} 
    />
  );
}

export default MyApp;