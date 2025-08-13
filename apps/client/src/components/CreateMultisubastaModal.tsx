import React, { useState, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { createMultisubasta, uploadMultipleImages } from '../api/auctionsApi';

interface CreateMultisubastaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMultisubastaCreated: () => void;
}

interface ItemFormData {
  imageFile: File | null;
  imagePreview: string | null;
  imageUrl: string;
  price: string;
  description: string;
}

const CreateMultisubastaModal: React.FC<CreateMultisubastaModalProps> = ({
  isOpen,
  onClose,
  onMultisubastaCreated
}) => {
  const { getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    endTime: ''
  });
  
  const [items, setItems] = useState<ItemFormData[]>([
    { imageFile: null, imagePreview: null, imageUrl: '', price: '', description: '' }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      
      // Validate form data
      if (!formData.title || !formData.description || !formData.endTime) {
        throw new Error('Por favor completa todos los campos requeridos');
      }
      
      // Validate items
      if (items.length === 0) {
        throw new Error('Debes agregar al menos un ítem');
      }
      
      // Check if all items have images
      const itemsWithoutImages = items.filter(item => !item.imageFile && !item.imageUrl);
      if (itemsWithoutImages.length > 0) {
        throw new Error('Todos los ítems deben tener una imagen');
      }
      
      // Upload images for items that have files
      const itemsToUpload = items.filter(item => item.imageFile);
      let uploadedImages: { imageUrl: string; publicId: string }[] = [];
      
      if (itemsToUpload.length > 0) {
        setUploadLoading(true);
        const filesToUpload = itemsToUpload.map(item => item.imageFile!);
        const uploadResult = await uploadMultipleImages(filesToUpload, token);
        setUploadLoading(false);
        
        if (!uploadResult) {
          throw new Error('Error al subir las imágenes');
        }
        
        uploadedImages = uploadResult;
      }
      
      // Map uploaded images to items
      let uploadIndex = 0;
      const processedItems = items.map(item => {
        if (item.imageFile) {
          const uploadedImage = uploadedImages[uploadIndex++];
          return {
            imageUrl: uploadedImage.imageUrl,
            price: item.price ? parseFloat(item.price) : undefined,
            description: item.description || undefined
          };
        } else {
          return {
            imageUrl: item.imageUrl,
            price: item.price ? parseFloat(item.price) : undefined,
            description: item.description || undefined
          };
        }
      });
      
      // Create the multisubasta
      const result = await createMultisubasta({
        title: formData.title,
        description: formData.description,
        endTime: new Date(formData.endTime),
        items: processedItems
      }, token);

      if (!result) {
        throw new Error('Error al crear la multisubasta');
      }

      onMultisubastaCreated();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        endTime: ''
      });
      setItems([{ imageFile: null, imagePreview: null, imageUrl: '', price: '', description: '' }]);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la multisubasta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleItemChange = (index: number, field: keyof ItemFormData, value: string | File | null) => {
    const newItems = [...items];
    
    if (field === 'imageFile') {
      const file = value as File;
      newItems[index].imageFile = file;
      
      // Create a preview
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const newItemsWithPreview = [...items];
          newItemsWithPreview[index].imagePreview = reader.result as string;
          setItems(newItemsWithPreview);
        };
        reader.readAsDataURL(file);
      }
    } else {
      // For other fields (string values)
      newItems[index][field] = value as string;
    }
    
    setItems(newItems);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      handleItemChange(index, 'imageFile', e.target.files[0]);
      // Clear the imageUrl field since we're using a file upload
      handleItemChange(index, 'imageUrl', '');
    }
  };
  
  const addItem = () => {
    if (items.length < 20) {
      setItems([...items, { imageFile: null, imagePreview: null, imageUrl: '', price: '', description: '' }]);
    } else {
      setError('No puedes agregar más de 20 ítems');
    }
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Crear Nueva Multisubasta</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título de la Multisubasta *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Finalización *
                </label>
                <input
                  type="date"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  min={minDate}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
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
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ítems de la Multisubasta</h3>
              
              {items.map((item, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Ítem #{index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Imagen *
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          Seleccionar Imagen
                        </button>
                        <input
                          type="file"
                          ref={el => { fileInputRefs.current[index] = el; }}
                          onChange={e => handleImageChange(e, index)}
                          accept="image/*"
                          className="hidden"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.imageFile ? item.imageFile.name : 'Ninguna imagen seleccionada'}
                        </span>
                      </div>
                      {item.imagePreview && (
                        <div className="mt-4">
                          <img
                            src={item.imagePreview}
                            alt="Preview"
                            className="h-40 object-contain rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Precio
                        </label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleItemChange(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Descripción del Ítem
                        </label>
                        <textarea
                          value={item.description}
                          onChange={e => handleItemChange(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addItem}
                disabled={items.length >= 20}
                className={`mt-4 px-4 py-2 rounded-md ${
                  items.length >= 20
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Agregar Ítem {items.length}/20
              </button>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isLoading || uploadLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading || uploadLoading}
              >
                {isLoading || uploadLoading ? 'Procesando...' : 'Crear Multisubasta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMultisubastaModal;