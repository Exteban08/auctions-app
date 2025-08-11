import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';

/**
 * Create a new Multisubasta with multiple items
 * @route POST /api/multisubastas/create
 */
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

      const { title, description, endTime, items } = req.body;

      // Validate required fields
      if (!title || !description || !endTime || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          error: 'Datos incompletos. Se requiere título, descripción, fecha de finalización y al menos un ítem.' 
        });
      }

      // Validate items limit
      if (items.length > 20) {
        return res.status(400).json({ error: 'No se pueden incluir más de 20 ítems en una Multisubasta.' });
      }

      // Validate each item has an imageUrl
      for (const item of items) {
        if (!item.imageUrl) {
          return res.status(400).json({ error: 'Todos los ítems deben tener una imagen.' });
        }
      }

      // Create the Multisubasta with its items
      const multisubasta = await prisma.multisubasta.create({
        data: {
          title,
          description,
          endTime: new Date(endTime),
          status: 'active',
          userId: req.user!.id,
          items: {
            create: items.map(item => ({
              imageUrl: item.imageUrl,
              price: item.price || null,
              description: item.description || null,
              creatorId: req.user!.id
            }))
          }
        },
        include: {
          items: true
        }
      });

      res.status(201).json({ 
        message: 'Multisubasta creada exitosamente',
        multisubasta 
      });
    } catch (error) {
      console.error('Error creating multisubasta:', error);
      
      // Type check for Prisma-specific errors
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Prisma error code:', error.code);
        console.error('Prisma error message:', (error as { message?: string }).message);
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
          return res.status(400).json({ error: 'Ya existe una multisubasta con esos datos' });
        }
        
        if (error.code === 'P2003') {
          return res.status(400).json({ error: 'Referencia a un registro que no existe' });
        }
      }
      
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Error desconocido';
      
      res.status(500).json({ error: 'Error interno del servidor', details: errorMessage });
    }
  });
}