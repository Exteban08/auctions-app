/**
 * API client for multisubastas
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface MultisubastaItem {
  id: string;
  imageUrl: string;
  price: number | null;
  description: string | null;
  creatorId: string;
  multisubastaId: string;
  comments: MultisubastaComment[];
  createdAt: string;
}

export interface MultisubastaComment {
  id: string;
  comment: string;
  offeredPrice: number | null;
  userId: string;
  userName: string;
  itemId: string;
  createdAt: string;
}

export interface Multisubasta {
  id: string;
  title: string;
  description: string;
  status: string;
  userId: string;
  items: MultisubastaItem[];
  createdAt: string;
  endTime: string;
}

/**
 * Fetch all active multisubastas
 */
export const fetchMultisubastas = async (): Promise<Multisubasta[]> => {
  try {
    const response = await fetch(`${API_URL}/api/multisubastas`);
    
    if (!response.ok) {
      throw new Error(`Error fetching multisubastas: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching multisubastas:', error);
    return [];
  }
};

/**
 * Upload multiple images for a multisubasta
 */
export const uploadMultipleImages = async (
  files: File[],
  token: string
): Promise<{ imageUrl: string; publicId: string }[] | null> => {
  try {
    if (!files.length) {
      throw new Error('No files provided');
    }

    // Limit to 20 files
    const filesToUpload = files.slice(0, 20);
    
    const formData = new FormData();
    filesToUpload.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${API_URL}/api/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error uploading images');
    }
    
    const data = await response.json();
    return data.images;
  } catch (error) {
    console.error('Error uploading images:', error);
    return null;
  }
};

/**
 * Create a new multisubasta
 */
export const createMultisubasta = async (
  multisubastaData: {
    title: string;
    description: string;
    endTime: Date;
    items: {
      imageUrl: string;
      price?: number;
      description?: string;
    }[];
  },
  token: string
): Promise<Multisubasta | null> => {
  try {
    const response = await fetch(`${API_URL}/api/multisubastas/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(multisubastaData)
    });
    
    if (!response.ok) {
      throw new Error(`Error creating multisubasta: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.multisubasta;
  } catch (error) {
    console.error('Error creating multisubasta:', error);
    return null;
  }
};

/**
 * Update the price of a multisubasta item
 */
export const updateItemPrice = async (
  itemId: string,
  price: number,
  token: string
): Promise<MultisubastaItem | null> => {
  try {
    const response = await fetch(`${API_URL}/api/multisubastas/items/${itemId}/price`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ price })
    });
    
    if (!response.ok) {
      throw new Error(`Error updating item price: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.item;
  } catch (error) {
    console.error('Error updating item price:', error);
    return null;
  }
};

/**
 * Add a comment to a multisubasta item
 */
export const addComment = async (
  itemId: string,
  commentData: {
    comment: string;
    offeredPrice?: number;
  },
  token: string
): Promise<MultisubastaComment | null> => {
  try {
    const response = await fetch(`${API_URL}/api/multisubastas/items/${itemId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(commentData)
    });
    
    if (!response.ok) {
      throw new Error(`Error adding comment: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};