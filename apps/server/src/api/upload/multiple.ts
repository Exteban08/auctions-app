import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // Cast to any to bypass the type checking issue
    ...(({
      folder: 'multisubastas',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 1000, crop: 'limit' }] // Optimize images
    } as any))
  }
});

// Configure multer for multiple file uploads
const upload = multer({ 
  storage: storage,
  limits: {
    files: 20 // Maximum 20 files
  }
});

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

      console.log('Received multiple upload request from user:', req.user.id);
      
      // Use multer to handle multiple file uploads
      upload.array('images', 20)(req, res, async (err) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).json({ error: 'Error al subir las imágenes: ' + err.message });
        }

        if (!req.files || req.files.length === 0) {
          console.error('No files in request after multer processing');
          return res.status(400).json({ error: 'No se han proporcionado imágenes' });
        }

        // Process uploaded files
        const files = req.files as Express.Multer.File[];
        const uploadResults = files.map(file => {
          // Make sure we're returning the correct path property
          const imageUrl = file.path || (file as any).secure_url;
          
          if (!imageUrl) {
            console.error('No image URL found in uploaded file:', file);
            return null;
          }
          
          return {
            imageUrl: imageUrl,
            publicId: file.filename
          };
        }).filter(result => result !== null);
        
        if (uploadResults.length === 0) {
          return res.status(500).json({ error: 'No se pudieron obtener las URLs de las imágenes' });
        }
        
        console.log(`Successfully uploaded ${uploadResults.length} images`);
        res.status(200).json({ 
          images: uploadResults
        });
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}