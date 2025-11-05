import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import jwt from 'jsonwebtoken';
import { prisma } from '@financial-portfolio/database';
import { logger } from '../utils/logger';

export interface Context {
  prisma: typeof prisma;
  userId?: string;
  user?: any;
}

export async function createContext({
  req,
}: ExpressContextFunctionArgument): Promise<Context> {
  const context: Context = {
    prisma,
  };

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        userId: string;
      };

      context.userId = decoded.userId;

      // Optionally load user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true,
          createdAt: true,
        },
      });

      if (user) {
        context.user = user;
      }
    } catch (error) {
      logger.warn('Invalid token:', error);
    }
  }

  return context;
}
