import { Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

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
    // The folder property is valid in the Cloudinary API but not properly typed in multer-storage-cloudinary
    ...(({
      folder: 'auctions',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 1000, crop: 'limit' }] // Optimize images
    } as any))
  }
});

const upload = multer({ storage: storage });

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

      console.log('Received upload request from user:', req.user.id);
      
      // Check if the request contains a file
      if (!req.files && !req.file) {
        console.log('No file detected in the request');
      }
      
      // Use multer to handle the file upload
      upload.single('image')(req, res, async (err) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).json({ error: 'Error al subir la imagen: ' + err.message });
        }

        if (!req.file) {
          console.error('No file in request after multer processing');
          return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
        }

        // Return the URL of the uploaded image
        console.log('Upload successful, file:', req.file);
        
        // Make sure we're returning the correct path property
        // Cloudinary typically provides the URL in the path or secure_url property
        const imageUrl = req.file.path || (req.file as any).secure_url;
        
        if (!imageUrl) {
          console.error('No image URL found in uploaded file:', req.file);
          return res.status(500).json({ error: 'No se pudo obtener la URL de la imagen' });
        }
        
        console.log('Returning image URL:', imageUrl);
        res.status(200).json({ 
          imageUrl: imageUrl,
          publicId: req.file.filename
        });
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}