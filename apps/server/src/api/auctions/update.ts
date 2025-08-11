import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

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

      const { id, title, description, imageUrl, startingBid, endTime, category } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de la subasta es requerido' });
      }

      // Validación básica
      if (!title || !description || !startingBid || !endTime || !category) {
        return res.status(400).json({ 
          error: 'Todos los campos son requeridos: título, descripción, puja inicial, tiempo de finalización y categoría' 
        });
      }

      if (startingBid <= 0) {
        return res.status(400).json({ error: 'La puja inicial debe ser mayor a 0' });
      }

      // Validar que la fecha de finalización sea en el futuro
      const endDate = new Date(endTime);
      const now = new Date();
      
      if (endDate <= now) {
        return res.status(400).json({ error: 'La fecha de finalización debe ser en el futuro' });
      }

      // Verificar que la subasta exista y pertenezca al usuario
      const existingAuction = await prisma.auction.findUnique({
        where: { id },
        include: { bids: true }
      });

      if (!existingAuction) {
        return res.status(404).json({ error: 'Subasta no encontrada' });
      }

      if (existingAuction.userId !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para editar esta subasta' });
      }

      // No permitir editar subastas con pujas
      if (existingAuction.bids.length > 0) {
        return res.status(400).json({ error: 'No se puede editar una subasta que ya tiene pujas' });
      }

      // Si hay una nueva imagen y la subasta ya tenía una imagen, eliminar la imagen anterior de Cloudinary
      if (imageUrl && imageUrl !== existingAuction.imageUrl && existingAuction.imageUrl) {
        try {
          // Extraer el public_id de la URL de Cloudinary
          const publicId = existingAuction.imageUrl.split('/').pop()?.split('.')[0];
          if (publicId && existingAuction.imageUrl.includes('cloudinary')) {
            await cloudinary.uploader.destroy(`auctions/${publicId}`);
          }
        } catch (error) {
          console.error('Error deleting old image from Cloudinary:', error);
          // Continuamos con la actualización aunque falle la eliminación de la imagen
        }
      }

      // Actualizar la subasta
      const updatedAuction = await prisma.auction.update({
        where: { id },
        data: {
          title,
          description,
          imageUrl: imageUrl || existingAuction.imageUrl,
          startingBid: parseFloat(startingBid.toString()),
          endTime: endDate,
          category
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

      res.status(200).json({
        message: 'Subasta actualizada exitosamente',
        auction: updatedAuction
      });
    } catch (error) {
      console.error('Error updating auction:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}