import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from '../context';
import { logger } from '../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

export const authResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.userId },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },
  },

  Mutation: {
    signUp: async (_parent: any, args: any, context: Context) => {
      const { email, password } = args.input;

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check if user exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await context.prisma.user.create({
        data: {
          email,
          encryptedPassword: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Create session
      await context.prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      logger.info(`User registered: ${user.email}`);

      return {
        user,
        accessToken,
        refreshToken,
      };
    },

    signIn: async (_parent: any, args: any, context: Context) => {
      const { email, password } = args.input;

      // Find user
      const user = await context.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.encryptedPassword);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Create session
      await context.prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      };
    },

    refreshToken: async (_parent: any, args: any, context: Context) => {
      const { refreshToken } = args;

      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

        // Verify session exists
        const session = await context.prisma.session.findFirst({
          where: {
            refreshToken,
            userId: decoded.userId,
          },
        });

        if (!session) {
          throw new Error('Invalid refresh token');
        }

        // Get user
        const user = await context.prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            twoFactorEnabled: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Generate new tokens
        const tokens = generateTokens(user.id);

        // Update session
        await context.prisma.session.update({
          where: { id: session.id },
          data: {
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          },
        });

        return {
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      } catch (error) {
        throw new Error('Invalid refresh token');
      }
    },
  },
};
