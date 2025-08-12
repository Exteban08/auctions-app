/**
 * API client for auctions and multisubastas
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Auction {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  endTime: string;
  seller: string;
  bidCount: number;
  bids: {
    userId: string;
    userName: string;
    amount: number;
  }[];
}

/**
 * Fetch all active auctions
 */
export const fetchAuctions = async (): Promise<Auction[]> => {
  try {
    const response = await fetch(`${API_URL}/api/auctions`);
    
    if (!response.ok) {
      throw new Error(`Error fetching auctions: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return [];
  }
};

/**
 * Create a new auction
 */
export const createAuction = async (auctionData: {
  title: string;
  description: string;
  imageUrl?: string;
  startingBid: number;
  category: string;
  endTime: Date;
}, token: string): Promise<Auction | null> => {
  try {
    const response = await fetch(`${API_URL}/api/auctions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(auctionData)
    });
    
    if (!response.ok) {
      throw new Error(`Error creating auction: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.auction;
  } catch (error) {
    console.error('Error creating auction:', error);
    return null;
  }
};

/**
 * Place a bid on an auction
 */
export const placeBid = async (
  auctionId: string, 
  amount: number, 
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/auctions/${auctionId}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    
    if (!response.ok) {
      throw new Error(`Error placing bid: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error placing bid:', error);
    return false;
  }
};

/**
 * Update an existing auction
 */
export const updateAuction = async (
  id: string,
  auctionData: {
    title: string;
    description: string;
    imageUrl?: string;
    startingBid: number;
    category: string;
    endTime: Date;
  }, 
  token: string
): Promise<Auction | null> => {
  try {
    const response = await fetch(`${API_URL}/api/auctions/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id,
        ...auctionData
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error updating auction: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.auction;
  } catch (error) {
    console.error('Error updating auction:', error);
    return null;
  }
};

/**
 * Multisubasta interfaces
 */
export interface MultisubastaComment {
  id: string;
  comment: string;
  offeredPrice?: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface MultisubastaItem {
  id: string;
  imageUrl: string;
  price?: number;
  description?: string;
  creatorId: string;
  comments: MultisubastaComment[];
  createdAt: string;
}

export interface Multisubasta {
  id: string;
  title: string;
  description: string;
  status: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
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
 * Create a new multisubasta
 */
export const createMultisubasta = async (data: {
  title: string;
  description: string;
  endTime: Date;
  items: {
    imageUrl: string;
    description?: string;
    price?: number;
  }[];
}, token: string): Promise<Multisubasta | null> => {
  try {
    const response = await fetch(`${API_URL}/api/multisubastas/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error creating multisubasta: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return responseData.multisubasta;
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

/**
 * Upload multiple images for a multisubasta
 */
export const uploadMultipleImages = async (
  files: File[],
  token: string
): Promise<{ imageUrl: string; publicId: string }[] | null> => {
  try {
    const formData = new FormData();
    
    // Append each file to the form data
    files.forEach((file) => {
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
      throw new Error(`Error uploading images: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.images;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return null;
  }
};