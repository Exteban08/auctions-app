// Shared types for the application
export type User = { 
  id: string; 
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type Auction = { id: string; title: string };
export type Bid = { id: string; amount: number };