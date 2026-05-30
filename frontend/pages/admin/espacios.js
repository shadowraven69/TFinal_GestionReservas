import { useState, useEffect } from 'react';
import Link from 'next/link';
import espacioService from '../../services/espacioService';
import { useRouter } from 'next/router';

const AdminEspaciosPage = () => {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEspacioId, setEditEspacioId] = useState(null);
  const [editEspacioData, setEditEspacioData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    estado: 'activo'
  });
  const [createEspacioData, setCreateEspacioData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    estado: 'activo'
  });
  const router = useRouter();

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        setLoading(true);
        const data = await espacioService.getEspacios();
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
  }, []);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateEspacioData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditEspacioData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      await espacioService.createEspacio(createEspacioData);
      setShowCreateModal(false);
      // Reset form
      setCreateEspacioData({
        nombre: '',
        ubicacion: '',
        capacidad: '',
        estado: 'activo'
      });
      // Refresh list
      const data = await espacioService.getEspacios();
      setEspacios(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al crear el espacio');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await espacioService.updateEspacio(editEspacioId, editEspacioData);
      setShowEditModal(false);
      // Refresh list
      const data = await espacioService.getEspacios();
      setEspacios(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al actualizar el espacio');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este espacio?')) {
      try {
        await espacioService.deleteEspacio(id);
        // Refresh list
        const data = await espacioService.getEspacios();
        setEspacios(data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Error al eliminar el espacio');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Gestión de Espacios
          </h1>
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
            Gestión de Espacios
          </h1>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <Link href="/admin" className="mr-4">
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Volver al Panel
            </button>
          </Link>
          <Link href="/admin/espacios/nuevo">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Nuevo Espacio
            </button>
          </Link>
          <div className="mt-6">
            {/* Tabla de espacios */}
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
            Gestión de Espacios
          </h1>
          <div className="flex space-x-3">
            <Link href="/admin" className="mr-2">
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Volver al Panel
              </button>
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Nuevo Espacio
            </button>
          </div>
        </div>

        {/* Modal para crear espacio */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Crear Nuevo Espacio</h2>
              <form onSubmit={handleSubmitCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={createEspacioData.nombre}
                    onChange={handleCreateChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={createEspacioData.ubicacion}
                    onChange={handleCreateChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    value={createEspacioData.capacidad}
                    onChange={handleCreateChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={createEspacioData.estado}
                    onChange={handleCreateChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded hover:shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Crear Espacio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para editar espacio */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Editar Espacio</h2>
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editEspacioData.nombre}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={editEspacioData.ubicacion}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    value={editEspacioData.capacidad}
                    onChange={handleEditChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={editEspacioData.estado}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded hover:shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Actualizar Espacio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {espacios.length === 0 ? (
          <p className="text-center py-12 text-gray-500">
            No hay espacios registrados. Cree el primero haciendo clic en "Nuevo Espacio".
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {espacios.map((espacio) => (
                  <tr key={espacio.id_espacio} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {espacio.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {espacio.ubicacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {espacio.capacidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        espacio.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : espacio.estado === 'inactivo' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {espacio.estado.charAt(0).toUpperCase() + espacio.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          const espacioEdit = espacios.find(e => e.id_espacio === espacio.id_espacio);
                          setEditEspacioData({
                            nombre: espacioEdit.nombre,
                            ubicacion: espacioEdit.ubicacion,
                            capacidad: espacioEdit.capacidad.toString(),
                            estado: espacioEdit.estado
                          });
                          setEditEspacioId(espacio.id_espacio);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(espacio.id_espacio)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEspaciosPage;