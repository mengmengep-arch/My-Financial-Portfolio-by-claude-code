import { Context } from '../context';
import { logger } from '../../utils/logger';

export const portfolioResolvers = {
  Query: {
    portfolio: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: args.id },
      });

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      if (portfolio.userId !== context.userId) {
        throw new Error('Not authorized to access this portfolio');
      }

      return portfolio;
    },

    portfolios: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      return context.prisma.portfolio.findMany({
        where: { userId: context.userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
    },

    portfolioValue: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: args.portfolioId },
      });

      if (!portfolio || portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      const { dbHelpers } = await import('@financial-portfolio/database');
      const value = await dbHelpers.calculatePortfolioValue(args.portfolioId);

      return {
        portfolioId: args.portfolioId,
        ...value,
        timestamp: new Date(),
      };
    },
  },

  Mutation: {
    createPortfolio: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { name, baseCurrency = 'THB' } = args.input;

      // Check if this is the first portfolio (make it default)
      const existingPortfolios = await context.prisma.portfolio.findMany({
        where: { userId: context.userId },
      });

      const isDefault = existingPortfolios.length === 0;

      const portfolio = await context.prisma.portfolio.create({
        data: {
          userId: context.userId,
          name,
          baseCurrency,
          isDefault,
        },
      });

      logger.info(`Portfolio created: ${portfolio.id} by user ${context.userId}`);

      return portfolio;
    },

    updatePortfolio: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: args.id },
      });

      if (!portfolio || portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      // If setting as default, unset other defaults
      if (args.input.isDefault) {
        await context.prisma.portfolio.updateMany({
          where: {
            userId: context.userId,
            id: { not: args.id },
          },
          data: { isDefault: false },
        });
      }

      const updatedPortfolio = await context.prisma.portfolio.update({
        where: { id: args.id },
        data: args.input,
      });

      logger.info(`Portfolio updated: ${portfolio.id}`);

      return updatedPortfolio;
    },

    deletePortfolio: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: args.id },
      });

      if (!portfolio || portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      await context.prisma.portfolio.delete({
        where: { id: args.id },
      });

      logger.info(`Portfolio deleted: ${args.id}`);

      return true;
    },
  },
};
