import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Helper functions for common database operations
export const dbHelpers = {
  /**
   * Get or create a default portfolio for a user
   */
  async getOrCreateDefaultPortfolio(userId: string, name: string = 'My Portfolio') {
    let portfolio = await prisma.portfolio.findFirst({
      where: { userId, isDefault: true },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name,
          isDefault: true,
        },
      });
    }

    return portfolio;
  },

  /**
   * Get or create an asset by symbol
   */
  async getOrCreateAsset(data: {
    symbol: string;
    name: string;
    assetType: string;
    exchange?: string;
    currency: string;
    sector?: string;
    industry?: string;
  }) {
    const asset = await prisma.asset.upsert({
      where: {
        symbol_exchange: {
          symbol: data.symbol,
          exchange: data.exchange || '',
        },
      },
      update: {
        name: data.name,
        assetType: data.assetType,
        sector: data.sector,
        industry: data.industry,
        updatedAt: new Date(),
      },
      create: data,
    });

    return asset;
  },

  /**
   * Calculate portfolio value with current prices
   */
  async calculatePortfolioValue(portfolioId: string) {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId },
      include: {
        asset: {
          include: {
            priceHistory: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    let totalValue = 0;
    let totalCost = 0;

    for (const holding of holdings) {
      const currentPrice = holding.asset.priceHistory[0]?.close || holding.averageCost;
      const value = Number(holding.quantity) * Number(currentPrice);
      const cost = Number(holding.quantity) * Number(holding.averageCost);

      totalValue += value;
      totalCost += cost;
    }

    return {
      totalValue,
      totalCost,
      totalGain: totalValue - totalCost,
      totalGainPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    };
  },

  /**
   * Create a portfolio snapshot
   */
  async createPortfolioSnapshot(portfolioId: string) {
    const { totalValue, totalCost } = await this.calculatePortfolioValue(portfolioId);

    const holdings = await prisma.holding.findMany({
      where: { portfolioId },
      include: { asset: true },
    });

    // Calculate allocation data
    const allocationByType: Record<string, number> = {};
    holdings.forEach((holding) => {
      const assetType = holding.asset.assetType;
      if (!allocationByType[assetType]) {
        allocationByType[assetType] = 0;
      }
      allocationByType[assetType] += Number(holding.quantity) * Number(holding.averageCost);
    });

    const snapshot = await prisma.portfolioSnapshot.create({
      data: {
        portfolioId,
        snapshotDate: new Date(),
        totalValue,
        totalCost,
        allocationData: { byType: allocationByType },
      },
    });

    return snapshot;
  },
};

// Export Prisma client and types
export * from '@prisma/client';
export default prisma;
