import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { MultisubastaItem, addComment, updateItemPrice } from '../api/auctionsApi';

interface MultisubastaItemCardProps {
  item: MultisubastaItem;
  isOwner: boolean;
  onItemUpdated: (updatedItem: MultisubastaItem) => void;
}

const MultisubastaItemCard: React.FC<MultisubastaItemCardProps> = ({
  item,
  isOwner,
  onItemUpdated
}) => {
  const { getAuthHeaders, isAuthenticated, user } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [newPrice, setNewPrice] = useState(item.price?.toString() || '');
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para comentar');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const headers = getAuthHeaders();
      const authHeader = headers['Authorization'];
      
      if (!authHeader) {
        throw new Error('No estás autenticado');
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Validate comment
      if (!comment.trim()) {
        throw new Error('El comentario no puede estar vacío');
      }
      
      // Validate offered price if provided
      let priceValue: number | undefined = undefined;
      if (offeredPrice) {
        priceValue = parseFloat(offeredPrice);
        if (isNaN(priceValue) || priceValue <= 0) {
          throw new Error('El precio ofrecido debe ser un número positivo');
        }
      }
      
      const result = await addComment(
        item.id,
        {
          comment: comment.trim(),
          offeredPrice: priceValue
        },
        token
      );

      if (!result) {
        throw new Error('Error al agregar el comentario');
      }

      // Update the item with the new comment
      const updatedItem = {
        ...item,
        comments: [...(item.comments || []), {
          ...result,
          userName: user?.name || 'Usuario'
        }]
      };
      
      onItemUpdated(updatedItem);
      
      // Reset form
      setComment('');
      setOfferedPrice('');
      setShowCommentForm(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar el comentario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setError('Solo el propietario puede actualizar el precio');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const headers = getAuthHeaders();
      const authHeader = headers['Authorization'];
      
      if (!authHeader) {
        throw new Error('No estás autenticado');
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Validate price
      if (!newPrice.trim()) {
        throw new Error('El precio no puede estar vacío');
      }
      
      const priceValue = parseFloat(newPrice);
      if (isNaN(priceValue) || priceValue < 0) {
        throw new Error('El precio debe ser un número positivo');
      }
      
      const result = await updateItemPrice(
        item.id,
        priceValue,
        token
      );

      if (!result) {
        throw new Error('Error al actualizar el precio');
      }

      // Update the item with the new price
      const updatedItem = {
        ...item,
        price: result.price
      };
      
      onItemUpdated(updatedItem);
      
      // Reset form
      setShowPriceForm(false);
    } catch (err) {
      console.error('Error updating price:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el precio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={item.imageUrl} 
          alt={item.description || 'Imagen de ítem'} 
          className="w-full h-64 object-cover"
        />
        {item.price !== null && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md">
            ${item.price.toFixed(2)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {item.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">{item.description}</p>
        )}
        
        {isOwner && (
          <div className="mb-4">
            {!showPriceForm ? (
              <button
                onClick={() => setShowPriceForm(true)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                {item.price !== null ? 'Actualizar precio' : 'Establecer precio'}
              </button>
            ) : (
              <form onSubmit={handleUpdatePrice} className="mt-2 space-y-2">
                <div>
                  <label htmlFor="newPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nuevo precio
                  </label>
                  <input
                    type="number"
                    id="newPrice"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPriceForm(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Comentarios ({item.comments?.length || 0})
          </h4>
          
          {item.comments && item.comments.length > 0 ? (
            <div className="space-y-3 mb-4">
              {item.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900 dark:text-white">{comment.userName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.comment}</p>
                  {comment.offeredPrice !== null && (
                    <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                      Precio ofrecido: ${comment.offeredPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No hay comentarios aún</p>
          )}
          
          {isAuthenticated && (
            <div>
              {!showCommentForm ? (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Agregar comentario
                </button>
              ) : (
                <form onSubmit={handleAddComment} className="mt-2 space-y-3">
                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Comentario
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="offeredPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Precio ofrecido (opcional)
                    </label>
                    <input
                      type="number"
                      id="offeredPrice"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isLoading ? 'Enviando...' : 'Enviar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultisubastaItemCard;