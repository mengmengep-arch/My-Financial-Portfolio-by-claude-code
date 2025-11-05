import { Context } from '../context';
import { getDateRangeForPeriod } from '@financial-portfolio/utils';

export const analyticsResolvers = {
  Query: {
    allocation: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: args.portfolioId },
      });

      if (!portfolio || portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      const holdings = await context.prisma.holding.findMany({
        where: { portfolioId: args.portfolioId },
        include: { asset: true },
      });

      // Calculate allocation by asset type
      const byAssetType: Record<string, { value: number; count: number }> = {};
      const bySector: Record<string, { value: number; count: number }> = {};
      let totalValue = 0;

      holdings.forEach((holding) => {
        const value = Number(holding.quantity) * Number(holding.averageCost);
        totalValue += value;

        // By asset type
        const type = holding.asset.assetType;
        if (!byAssetType[type]) {
          byAssetType[type] = { value: 0, count: 0 };
        }
        byAssetType[type].value += value;
        byAssetType[type].count += 1;

        // By sector
        if (holding.asset.sector) {
          const sector = holding.asset.sector;
          if (!bySector[sector]) {
            bySector[sector] = { value: 0, count: 0 };
          }
          bySector[sector].value += value;
          bySector[sector].count += 1;
        }
      });

      // Convert to array format with percentages
      const byAssetTypeArray = Object.entries(byAssetType).map(([type, data]) => ({
        type,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        count: data.count,
      }));

      const bySectorArray = Object.entries(bySector).map(([type, data]) => ({
        type,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        count: data.count,
      }));

      return {
        portfolioId: args.portfolioId,
        byAssetType: byAssetTypeArray,
        bySector: bySectorArray,
        byGeography: [], // TODO: Implement geography allocation
        cashPercentage: 0, // TODO: Calculate cash percentage
      };
    },

    performance: async (_parent: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id: args.portfolioId },
      });

      if (!portfolio || portfolio.userId !== context.userId) {
        throw new Error('Not authorized');
      }

      const { startDate, endDate } = getDateRangeForPeriod(args.period);

      // Get snapshots for the period
      const snapshots = await context.prisma.portfolioSnapshot.findMany({
        where: {
          portfolioId: args.portfolioId,
          snapshotDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { snapshotDate: 'asc' },
      });

      if (snapshots.length === 0) {
        return {
          portfolioId: args.portfolioId,
          period: args.period,
          totalReturn: 0,
          totalReturnPercent: 0,
          timeWeightedReturn: 0,
          sharpeRatio: null,
          volatility: null,
          maxDrawdown: null,
        };
      }

      const startValue = Number(snapshots[0].totalValue);
      const endValue = Number(snapshots[snapshots.length - 1].totalValue);
      const totalReturn = endValue - startValue;
      const totalReturnPercent = startValue > 0 ? (totalReturn / startValue) * 100 : 0;

      // Calculate volatility (standard deviation of returns)
      const returns = snapshots
        .slice(1)
        .map((snapshot, i) => {
          const prevValue = Number(snapshots[i].totalValue);
          const currValue = Number(snapshot.totalValue);
          return ((currValue - prevValue) / prevValue) * 100;
        })
        .filter((r) => !isNaN(r));

      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance =
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);

      // Calculate Sharpe Ratio (assuming 2% risk-free rate)
      const riskFreeRate = 0.02;
      const sharpeRatio = volatility > 0 ? (totalReturnPercent - riskFreeRate) / volatility : 0;

      // Calculate max drawdown
      let maxDrawdown = 0;
      let peak = startValue;

      snapshots.forEach((snapshot) => {
        const value = Number(snapshot.totalValue);
        if (value > peak) {
          peak = value;
        }
        const drawdown = ((peak - value) / peak) * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      });

      return {
        portfolioId: args.portfolioId,
        period: args.period,
        totalReturn,
        totalReturnPercent,
        timeWeightedReturn: totalReturnPercent, // Simplified for MVP
        sharpeRatio,
        volatility,
        maxDrawdown,
      };
    },
  },
};
