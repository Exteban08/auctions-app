import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';

/**
 * Add a comment to a MultisubastaItem
 * @route POST /api/multisubastas/items/:itemId/comments
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

      const { itemId } = req.params;
      const { comment, offeredPrice } = req.body;

      // Validate required fields
      if (!itemId) {
        return res.status(400).json({ error: 'Se requiere el ID del ítem.' });
      }

      if (!comment || comment.trim() === '') {
        return res.status(400).json({ error: 'Se requiere un comentario.' });
      }

      // Validate offeredPrice if provided
      if (offeredPrice !== undefined && offeredPrice !== null && isNaN(parseFloat(offeredPrice))) {
        return res.status(400).json({ error: 'El precio ofrecido debe ser un número válido.' });
      }

      // Find the item
      const item = await prisma.multisubastaItem.findUnique({
        where: { id: itemId },
        include: { multisubasta: true }
      });

      if (!item) {
        return res.status(404).json({ error: 'Ítem no encontrado.' });
      }

      // Create the comment
      const newComment = await prisma.multisubastaComment.create({
        data: {
          comment,
          offeredPrice: offeredPrice ? parseFloat(offeredPrice) : null,
          itemId,
          userId: req.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.status(201).json({ 
        message: 'Comentario agregado exitosamente',
        comment: newComment 
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}