import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { schema } from './graphql/schema';
import { createContext } from './graphql/context';
import { logger } from './utils/logger';
import { authMiddleware } from './middleware/auth';
import { setupWebSocket } from './services/websocket';
import { prisma } from '@financial-portfolio/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

async function startServer() {
  // Create Express app
  const app = express();
  const httpServer = createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      credentials: true,
    },
  });
  setupWebSocket(io);

  // Middleware
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return error;
    },
  });

  await apolloServer.start();

  // Apply GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: createContext,
    })
  );

  // File upload endpoint (for OCR)
  app.post('/api/upload', authMiddleware, (req, res) => {
    res.json({ message: 'Upload endpoint - to be implemented' });
  });

  // Start server
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    logger.info(`🔌 WebSocket ready at ws://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
