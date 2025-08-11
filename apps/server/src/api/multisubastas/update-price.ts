import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update the price of a MultisubastaItem
 * @route PUT /api/multisubastas/items/:itemId/price
 */
export default async function handler(req: AuthenticatedRequest, res: Response) {
  // Apply authentication middleware
  authenticateToken(req, res, async () => {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { itemId } = req.params;
      const { price } = req.body;

      // Validate required fields
      if (!itemId) {
        return res.status(400).json({ error: 'Se requiere el ID del ítem.' });
      }

      if (price === undefined || price === null || isNaN(parseFloat(price))) {
        return res.status(400).json({ error: 'Se requiere un precio válido.' });
      }

      // Find the item
      const item = await prisma.multisubastaItem.findUnique({
        where: { id: itemId },
        include: { multisubasta: true }
      });

      if (!item) {
        return res.status(404).json({ error: 'Ítem no encontrado.' });
      }

      // Check if the user is the creator of the multisubasta
      if (item.multisubasta.userId !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar este ítem.' });
      }

      // Update the price
      const updatedItem = await prisma.multisubastaItem.update({
        where: { id: itemId },
        data: { price: parseFloat(price) }
      });

      res.status(200).json({ 
        message: 'Precio actualizado exitosamente',
        item: updatedItem 
      });
    } catch (error) {
      console.error('Error updating item price:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}