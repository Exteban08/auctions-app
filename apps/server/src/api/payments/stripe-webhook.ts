import { Request, Response } from 'express';

// Placeholder for Stripe webhook endpoint
export default async function handler(req: Request, res: Response) {
  res.status(200).json({ message: 'Stripe webhook (placeholder)' });
}