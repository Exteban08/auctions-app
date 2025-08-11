import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';

export default async function handler(req: AuthenticatedRequest, res: Response) {
  // Apply authentication middleware
  authenticateToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      console.log('Received auction creation request:', req.body);
      const { title, description, imageUrl, startingBid, endTime, category } = req.body;

      // Validación básica
      if (!title || !description || !startingBid || !endTime || !category) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ 
          error: 'Todos los campos son requeridos: título, descripción, puja inicial, tiempo de finalización y categoría' 
        });
      }

      if (startingBid <= 0) {
        console.log('Validation failed - starting bid must be greater than 0');
        return res.status(400).json({ error: 'La puja inicial debe ser mayor a 0' });
      }

      // Validar que la fecha de finalización sea en el futuro
      const endDate = new Date(endTime);
      const now = new Date();
      
      if (endDate <= now) {
        console.log('Validation failed - end date must be in the future');
        return res.status(400).json({ error: 'La fecha de finalización debe ser en el futuro' });
      }

      console.log('Creating auction with data:', {
        title,
        description,
        imageUrl: imageUrl || null,
        startingBid: parseFloat(startingBid),
        endTime: endDate,
        startTime: now,
        status: 'ACTIVE',
        category,
        userId: req.user.id
      });

      // Crear la subasta
      const auction = await prisma.auction.create({
        data: {
          title,
          description,
          imageUrl: imageUrl || null,
          startingBid: parseFloat(startingBid),
          endTime: endDate,
          startTime: now,
          status: 'ACTIVE',
          category,
          userId: req.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log('Auction created successfully:', auction.id);
      res.status(201).json({
        message: 'Subasta creada exitosamente',
        auction
      });
    } catch (error) {
      console.error('Error creating auction:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
} 