import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: Response) {
  // Apply authentication middleware
  authenticateToken(req, res, async () => {
    try {
      // This code only runs if authentication is successful
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      res.status(200).json({
        message: 'Perfil obtenido exitosamente',
        user: req.user
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
} 