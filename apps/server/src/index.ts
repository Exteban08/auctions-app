import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import signupHandler from './api/auth/signup';
import loginHandler from './api/auth/login';
import profileHandler from './api/user/profile';
import createAuctionHandler from './api/auctions/create';
import updateAuctionHandler from './api/auctions/update';
import { getAuctions } from './api/auctions/get';
import uploadHandler from './api/upload';
import multipleUploadHandler from './api/upload/multiple';
import createMultisubastaHandler from './api/multisubastas/create';
import updatePriceHandler from './api/multisubastas/update-price';
import addCommentHandler from './api/multisubastas/add-comment';
import { getMultisubastas } from './api/multisubastas/get';
import { prisma } from './lib/prisma';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auctions App Server is running' });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'OK', message: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error });
  }
});

// Auth routes
app.post('/api/auth/signup', signupHandler);
app.post('/api/auth/login', loginHandler);

// Protected routes
app.get('/api/user/profile', profileHandler);

// Auction routes
app.get('/api/auctions', getAuctions);
app.post('/api/auctions/create', createAuctionHandler);
app.put('/api/auctions/update', updateAuctionHandler);

// Upload routes
app.post('/api/upload', uploadHandler);
app.post('/api/upload/multiple', multipleUploadHandler);

// Multisubasta routes
app.get('/api/multisubastas', getMultisubastas);
app.post('/api/multisubastas/create', createMultisubastaHandler);
app.put('/api/multisubastas/items/:itemId/price', updatePriceHandler);
app.post('/api/multisubastas/items/:itemId/comments', addCommentHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/`);
  console.log(`👤 Protected routes: http://localhost:${PORT}/api/user/`);
  console.log(`🏷️  Auction routes: http://localhost:${PORT}/api/auctions/`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/test-db`);
}); 