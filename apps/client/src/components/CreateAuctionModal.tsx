import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { createAuction } from '../api/auctionsApi';

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuctionCreated: () => void;
}

const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({
  isOpen,
  onClose,
  onAuctionCreated
}) => {
  const { getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startingBid: '',
    endTime: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const headers = getAuthHeaders();
      const authHeader = headers['Authorization'];
      
      if (!authHeader) {
        throw new Error('No estás autenticado');
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Handle image upload if there's a file
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        console.log('Uploading image file...');
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          throw new Error('Error al subir la imagen');
        }
        console.log('Image uploaded successfully, URL:', imageUrl);
      } else if (!imageUrl) {
        console.log('No image file or URL provided');
      }
      
      console.log('Creating auction with data:', {
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl,
        startingBid: parseFloat(formData.startingBid),
        category: formData.category,
        endTime: new Date(formData.endTime)
      });
      
      const result = await createAuction({
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl,
        startingBid: parseFloat(formData.startingBid),
        category: formData.category,
        endTime: new Date(formData.endTime)
      }, token);

      if (!result) {
        throw new Error('Error al crear la subasta');
      }

      console.log('Auction created successfully:', result);
      onAuctionCreated();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        startingBid: '',
        endTime: '',
        category: ''
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la subasta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear the imageUrl field since we're using a file upload
      setFormData(prev => ({
        ...prev,
        imageUrl: ''
      }));
    }
  };
  
  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    setUploadLoading(true);
    setError('');
    
    try {
      const headers = getAuthHeaders();
      const authHeader = headers['Authorization'];
      
      if (!authHeader) {
        throw new Error('No estás autenticado');
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Use the full API URL instead of a relative path
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }
      
      const data = await response.json();
      console.log('Image upload response:', data);
      
      if (!data.imageUrl) {
        throw new Error('La URL de la imagen no se recibió correctamente');
      }
      
      return data.imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Crear Nueva Subasta</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título de la Subasta *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Carta Rara de Dragón Blanco de Ojos Azules"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe el artículo, su condición, rareza, etc."
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagen
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="max-h-40 rounded-md border border-gray-300 dark:border-gray-600" 
                    />
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  O proporciona una URL de imagen
                </div>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  disabled={!!imageFile}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startingBid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Puja Inicial (MXN) *
                </label>
                <input
                  type="number"
                  id="startingBid"
                  name="startingBid"
                  value={formData.startingBid}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="1000"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Yugioh">Yugioh</option>
                  <option value="Coleccionables">Coleccionables</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha y Hora de Finalización *
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                min={minDate}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || uploadLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {uploadLoading ? 'Subiendo Imagen...' : isLoading ? 'Creando Subasta...' : 'Crear Subasta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuctionModal; 