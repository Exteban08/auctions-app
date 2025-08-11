import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Multisubasta, MultisubastaItem, fetchMultisubastas } from '../api/auctionsApi';
import MultisubastaItemCard from './MultisubastaItemCard';
import CreateMultisubastaModal from './CreateMultisubastaModal';

const MultisubastaSection: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [multisubastas, setMultisubastas] = useState<Multisubasta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMultisubasta, setSelectedMultisubasta] = useState<Multisubasta | null>(null);

  useEffect(() => {
    loadMultisubastas();
  }, []);

  const loadMultisubastas = async () => {
    setLoading(true);
    try {
      const data = await fetchMultisubastas();
      setMultisubastas(data);
    } catch (err) {
      console.error('Error loading multisubastas:', err);
      setError('Error al cargar las multisubastas');
    } finally {
      setLoading(false);
    }
  };

  const handleMultisubastaCreated = () => {
    loadMultisubastas();
  };

  const handleItemUpdated = (updatedItem: MultisubastaItem) => {
    if (!selectedMultisubasta) return;

    // Update the item in the selected multisubasta
    const updatedItems = selectedMultisubasta.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );

    const updatedMultisubasta = {
      ...selectedMultisubasta,
      items: updatedItems
    };

    // Update the selected multisubasta
    setSelectedMultisubasta(updatedMultisubasta);

    // Update the multisubasta in the list
    const updatedMultisubastas = multisubastas.map(ms => 
      ms.id === updatedMultisubasta.id ? updatedMultisubasta : ms
    );
    
    setMultisubastas(updatedMultisubastas);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section id="multisubastas" className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Multisubastas</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Crear Multisubasta
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Cargando multisubastas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : multisubastas.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-300">No hay multisubastas activas en este momento.</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Crear la primera Multisubasta
              </button>
            )}
          </div>
        ) : (
          <div>
            {selectedMultisubasta ? (
              <div>
                <button
                  onClick={() => setSelectedMultisubasta(null)}
                  className="mb-6 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a todas las multisubastas
                </button>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedMultisubasta.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{selectedMultisubasta.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Creado por: {selectedMultisubasta.userId}</span>
                    <span>Finaliza: {formatDate(selectedMultisubasta.endTime)}</span>
                    <span>Estado: {selectedMultisubasta.status === 'active' ? 'Activo' : 'Finalizado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedMultisubasta.items.map(item => (
                    <MultisubastaItemCard
                      key={item.id}
                      item={item}
                      isOwner={user?.id === selectedMultisubasta.userId}
                      onItemUpdated={handleItemUpdated}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {multisubastas.map(multisubasta => (
                  <div
                    key={multisubasta.id}
                    className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                    onClick={() => setSelectedMultisubasta(multisubasta)}
                  >
                    <div className="relative">
                      {multisubasta.items.length > 0 && (
                        <img
                          src={multisubasta.items[0].imageUrl}
                          alt={multisubasta.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md">
                        {multisubasta.items.length} {multisubasta.items.length === 1 ? 'ítem' : 'ítems'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{multisubasta.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{multisubasta.description}</p>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Finaliza: {formatDate(multisubasta.endTime).split(',')[0]}</span>
                        <span>{multisubasta.status === 'active' ? 'Activo' : 'Finalizado'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateMultisubastaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMultisubastaCreated={handleMultisubastaCreated}
      />
    </section>
  );
};

export default MultisubastaSection;