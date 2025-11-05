import { format, parseISO, subDays, subMonths, subYears, startOfYear } from 'date-fns';

/**
 * Format currency with proper localization
 */
export const formatCurrency = (amount: number, currency: string = 'THB'): string => {
  const locale = currency === 'THB' ? 'th-TH' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

/**
 * Calculate percentage change
 */
export const calculatePercentChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Get date range for period
 */
export const getDateRangeForPeriod = (period: string): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  let startDate: Date;

  switch (period) {
    case '1D':
      startDate = subDays(endDate, 1);
      break;
    case '1W':
      startDate = subDays(endDate, 7);
      break;
    case '1M':
      startDate = subMonths(endDate, 1);
      break;
    case '3M':
      startDate = subMonths(endDate, 3);
      break;
    case '6M':
      startDate = subMonths(endDate, 6);
      break;
    case 'YTD':
      startDate = startOfYear(endDate);
      break;
    case '1Y':
      startDate = subYears(endDate, 1);
      break;
    case '3Y':
      startDate = subYears(endDate, 3);
      break;
    case '5Y':
      startDate = subYears(endDate, 5);
      break;
    default:
      startDate = subYears(endDate, 1);
  }

  return { startDate, endDate };
};

/**
 * Calculate Time-Weighted Return (TWR)
 */
export const calculateTWR = (returns: number[]): number => {
  if (returns.length === 0) return 0;

  let twr = 1;
  returns.forEach((r) => {
    twr *= 1 + r / 100;
  });

  return (twr - 1) * 100;
};

/**
 * Calculate Sharpe Ratio
 */
export const calculateSharpeRatio = (
  returns: number[],
  riskFreeRate: number = 0.02
): number => {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return (avgReturn - riskFreeRate) / stdDev;
};

/**
 * Calculate maximum drawdown
 */
export const calculateMaxDrawdown = (values: number[]): number => {
  if (values.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = values[0];

  values.forEach((value) => {
    if (value > peak) {
      peak = value;
    }
    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
};

/**
 * Validate Thai stock symbol
 */
export const isValidThaiStockSymbol = (symbol: string): boolean => {
  return /^[A-Z0-9]{2,10}$/.test(symbol);
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Format date
 */
export const formatDate = (date: Date | string, formatStr: string = 'PP'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Calculate portfolio allocation percentages
 */
export const calculateAllocationPercentages = (
  allocations: Array<{ value: number }>
): Array<{ value: number; percentage: number }> => {
  const total = allocations.reduce((sum, item) => sum + item.value, 0);

  return allocations.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));
};

/**
 * Calculate FIFO cost basis for sells
 */
export const calculateFIFOCost = (
  purchases: Array<{ quantity: number; price: number; date: Date }>,
  sellQuantity: number
): { costBasis: number; remainingPurchases: typeof purchases } => {
  const sortedPurchases = [...purchases].sort((a, b) => a.date.getTime() - b.date.getTime());
  let remainingToSell = sellQuantity;
  let totalCost = 0;
  const remainingPurchases: typeof purchases = [];

  for (const purchase of sortedPurchases) {
    if (remainingToSell <= 0) {
      remainingPurchases.push(purchase);
      continue;
    }

    if (purchase.quantity <= remainingToSell) {
      // Sell entire lot
      totalCost += purchase.quantity * purchase.price;
      remainingToSell -= purchase.quantity;
    } else {
      // Partial sell
      totalCost += remainingToSell * purchase.price;
      remainingPurchases.push({
        ...purchase,
        quantity: purchase.quantity - remainingToSell,
      });
      remainingToSell = 0;
    }
  }

  return {
    costBasis: sellQuantity > 0 ? totalCost / sellQuantity : 0,
    remainingPurchases,
  };
};

export default {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  calculatePercentChange,
  getDateRangeForPeriod,
  calculateTWR,
  calculateSharpeRatio,
  calculateMaxDrawdown,
  isValidThaiStockSymbol,
  isValidEmail,
  generateId,
  debounce,
  formatDate,
  calculateAllocationPercentages,
  calculateFIFOCost,
};
