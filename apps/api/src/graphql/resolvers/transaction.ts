import { Context } from '../context';
import { logger } from '../../utils/logger';

export const transactionResolvers = {
  Query: {
    transactions: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: args.portfolioId },
      });

      if (!portfolio || portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      const limit = args.limit || 50;
      const offset = args.offset || 0;

      return context.prisma.transaction.findMany({
        where: { portfolioId: args.portfolioId },
        include: { asset: true },
        orderBy: { transactionDate: 'desc' },
        take: limit,
        skip: offset,
      });
    },

    searchAssets: async (_parent: any, args: any, _context: Context) => {
      const { query } = args;

      if (!query || query.length < 2) {
        return [];
      }

      const assets = await _context.prisma.asset.findMany({
        where: {
          OR: [
            { symbol: { contains: query.toUpperCase(), mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 20,
      });

      return assets;
    },
  },

  Mutation: {
    addTransaction: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { portfolioId, assetSymbol, assetName, assetType, exchange, ...transactionData } =
        args.input;

      // Verify portfolio ownership
      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: portfolioId },
      });

      if (!portfolio || portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      // Get or create asset
      const { dbHelpers } = await import('@financial-portfolio/database');
      const asset = await dbHelpers.getOrCreateAsset({
        symbol: assetSymbol.toUpperCase(),
        name: assetName,
        assetType,
        exchange,
        currency: portfolio.baseCurrency,
      });

      // Create transaction
      const transaction = await context.prisma.transaction.create({
        data: {
          portfolioId,
          assetId: asset.id,
          ...transactionData,
        },
        include: { asset: true },
      });

      // Update or create holding
      if (transactionData.transactionType === 'BUY') {
        const existingHolding = await context.prisma.holding.findUnique({
          where: {
            portfolioId_assetId: {
              portfolioId,
              assetId: asset.id,
            },
          },
        });

        if (existingHolding) {
          // Update average cost
          const totalQuantity =
            Number(existingHolding.quantity) + Number(transactionData.quantity);
          const totalCost =
            Number(existingHolding.quantity) * Number(existingHolding.averageCost) +
            Number(transactionData.quantity) * Number(transactionData.price);
          const newAverageCost = totalCost / totalQuantity;

          await context.prisma.holding.update({
            where: { id: existingHolding.id },
            data: {
              quantity: totalQuantity,
              averageCost: newAverageCost,
              lastUpdate: new Date(),
            },
          });
        } else {
          // Create new holding
          await context.prisma.holding.create({
            data: {
              portfolioId,
              assetId: asset.id,
              quantity: transactionData.quantity,
              averageCost: transactionData.price,
              firstPurchaseDate: transactionData.transactionDate,
            },
          });
        }
      } else if (transactionData.transactionType === 'SELL') {
        const existingHolding = await context.prisma.holding.findUnique({
          where: {
            portfolioId_assetId: {
              portfolioId,
              assetId: asset.id,
            },
          },
        });

        if (existingHolding) {
          const newQuantity = Number(existingHolding.quantity) - Number(transactionData.quantity);

          if (newQuantity <= 0) {
            // Delete holding if fully sold
            await context.prisma.holding.delete({
              where: { id: existingHolding.id },
            });
          } else {
            // Update quantity
            await context.prisma.holding.update({
              where: { id: existingHolding.id },
              data: {
                quantity: newQuantity,
                lastUpdate: new Date(),
              },
            });
          }
        }
      }

      logger.info(`Transaction added: ${transaction.id} for portfolio ${portfolioId}`);

      return transaction;
    },

    deleteTransaction: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const transaction = await context.prisma.transaction.findUnique({
        where: { id: args.id },
        include: { portfolio: true },
      });

      if (!transaction || transaction.portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      await context.prisma.transaction.delete({
        where: { id: args.id },
      });

      logger.info(`Transaction deleted: ${args.id}`);

      return true;
    },
  },
};
