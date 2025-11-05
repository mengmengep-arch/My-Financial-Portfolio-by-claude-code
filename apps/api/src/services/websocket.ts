import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupWebSocket(io: SocketIOServer) {
  // Authentication middleware for WebSocket
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      logger.warn('WebSocket authentication failed:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`WebSocket client connected: ${socket.id}, User: ${socket.userId}`);

    // Subscribe to portfolio updates
    socket.on('subscribe:portfolio', (portfolioId: string) => {
      socket.join(`portfolio:${portfolioId}`);
      logger.info(`Client ${socket.id} subscribed to portfolio ${portfolioId}`);
    });

    // Unsubscribe from portfolio updates
    socket.on('unsubscribe:portfolio', (portfolioId: string) => {
      socket.leave(`portfolio:${portfolioId}`);
      logger.info(`Client ${socket.id} unsubscribed from portfolio ${portfolioId}`);
    });

    // Subscribe to price updates
    socket.on('subscribe:prices', (symbols: string[]) => {
      symbols.forEach((symbol) => {
        socket.join(`price:${symbol}`);
      });
      logger.info(`Client ${socket.id} subscribed to prices: ${symbols.join(', ')}`);
    });

    // Unsubscribe from price updates
    socket.on('unsubscribe:prices', (symbols: string[]) => {
      symbols.forEach((symbol) => {
        socket.leave(`price:${symbol}`);
      });
      logger.info(`Client ${socket.id} unsubscribed from prices: ${symbols.join(', ')}`);
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Helper functions to emit updates
export function emitPortfolioUpdate(io: SocketIOServer, portfolioId: string, data: any) {
  io.to(`portfolio:${portfolioId}`).emit('portfolio:update', {
    portfolioId,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function emitPriceUpdate(io: SocketIOServer, symbol: string, data: any) {
  io.to(`price:${symbol}`).emit('price:update', {
    symbol,
    data,
    timestamp: new Date().toISOString(),
  });
}
