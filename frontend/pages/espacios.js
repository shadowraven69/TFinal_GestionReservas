import { useState, useEffect } from 'react';
import Link from 'next/link';
import EspacioCard from '../components/EspacioCard';
import espacioService from '../services/espacioService';

const EspaciosPage = () => {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        setLoading(true);
        const data = await espacioService.getEspacios(filtroEstado || null);
        setEspacios(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error al cargar los espacios');
        setEspacios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEspacios();
  }, [filtroEstado]);

  const handleEstadoChange = (e) => {
    setFiltroEstado(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Espacios Institucionales
          </h1>
          <div className="flex items-center space-x-4 mb-8">
            <select
              value={filtroEstado}
              onChange={handleEstadoChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="animate-pulse flex items-center justify-center h-64">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-64"></div>
              <div className="h-6 bg-gray-300 rounded w-48"></div>
              <div className="h-6 bg-gray-300 rounded w-56"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Espacios Institucionales
          </h1>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <div className="flex items-center space-x-4 mb-8">
            <select
              value={filtroEstado}
              onChange={handleEstadoChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mostrar mensaje de que no hay espacios */}
            <p className="col-span-3 text-center py-12 text-gray-500">
              No se encontraron espacios
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Espacios Institucionales
          </h1>
          <div className="flex items-center space-x-4">
            <select
              value={filtroEstado}
              onChange={handleEstadoChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
            {/* Enlace solo para administradores (se mostrará/ocultará basado en rol) */}
            <Link
              href="/admin/espacios"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              // Este enlace se mostrará/ocultará en el componente basado en el rol del usuario
            >
              Gestionar Espacios
            </Link>
          </div>
        </div>

        {espacios.length === 0 ? (
          <p className="text-center py-12 text-gray-500">
            No se encontraron espacios con los filtros aplicados
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {espacios.map((espacio) => (
              <EspacioCard key={espacio.id_espacio} espacio={espacio} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EspaciosPage;