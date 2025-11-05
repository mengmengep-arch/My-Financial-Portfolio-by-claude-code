// Core Types
export interface User {
  id: string;
  email: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  baseCurrency: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Types
export enum AssetType {
  STOCK_TH = 'STOCK_TH',
  STOCK_US = 'STOCK_US',
  STOCK_INTL = 'STOCK_INTL',
  RMF = 'RMF',
  SSF = 'SSF',
  LTF = 'LTF',
  MUTUAL_FUND = 'MUTUAL_FUND',
  ETF = 'ETF',
  BOND = 'BOND',
  DEBENTURE = 'DEBENTURE',
  REIT = 'REIT',
  COMMODITY = 'COMMODITY',
  CRYPTO = 'CRYPTO',
  CASH = 'CASH',
}

export enum Exchange {
  SET = 'SET',
  MAI = 'MAI',
  NYSE = 'NYSE',
  NASDAQ = 'NASDAQ',
  LSE = 'LSE',
  HKEX = 'HKEX',
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  exchange?: Exchange;
  sector?: string;
  industry?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Holdings Types
export interface Holding {
  id: string;
  portfolioId: string;
  assetId: string;
  quantity: number;
  averageCost: number;
  currentPrice?: number;
  firstPurchaseDate: Date;
  lastUpdate: Date;
  asset?: Asset;
}

// Transaction Types
export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
  SPLIT = 'SPLIT',
  RIGHTS = 'RIGHTS',
  MERGER = 'MERGER',
}

export interface Transaction {
  id: string;
  portfolioId: string;
  assetId: string;
  transactionType: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  transactionDate: Date;
  notes?: string;
  createdAt: Date;
  asset?: Asset;
}

export interface TransactionInput {
  portfolioId: string;
  assetId: string;
  transactionType: TransactionType;
  quantity: number;
  price: number;
  fees?: number;
  transactionDate: Date;
  notes?: string;
}

// Price Data Types
export interface PricePoint {
  assetId: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

// Portfolio Analytics Types
export interface PortfolioValue {
  portfolioId: string;
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  timestamp: Date;
}

export interface AssetAllocation {
  assetType: AssetType;
  value: number;
  percentage: number;
  count: number;
}

export interface AllocationData {
  portfolioId: string;
  byAssetType: AssetAllocation[];
  bySector: Array<{ sector: string; value: number; percentage: number }>;
  byGeography: Array<{ region: string; value: number; percentage: number }>;
  cashPercentage: number;
}

export interface PerformanceMetrics {
  portfolioId: string;
  period: Period;
  totalReturn: number;
  totalReturnPercent: number;
  timeWeightedReturn: number;
  moneyWeightedReturn: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  winRate: number;
}

export enum Period {
  ONE_DAY = '1D',
  ONE_WEEK = '1W',
  ONE_MONTH = '1M',
  THREE_MONTHS = '3M',
  SIX_MONTHS = '6M',
  YTD = 'YTD',
  ONE_YEAR = '1Y',
  THREE_YEARS = '3Y',
  FIVE_YEARS = '5Y',
  ALL = 'ALL',
}

// OCR Types
export enum BrokerType {
  STREAMING = 'STREAMING',
  SETTRADE = 'SETTRADE',
  KTB = 'KTB',
  FINNOMENA = 'FINNOMENA',
  SCB = 'SCB',
}

export interface OCRResult {
  sessionId: string;
  brokerType: BrokerType;
  confidence: number;
  extractedData: ExtractedHolding[];
  requiresReview: boolean;
  imageUrl: string;
}

export interface ExtractedHolding {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  confidence: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tax Types
export interface TaxReport {
  portfolioId: string;
  year: number;
  capitalGains: number;
  dividendIncome: number;
  taxableIncome: number;
  estimatedTax: number;
  transactions: TaxTransaction[];
}

export interface TaxTransaction {
  transactionId: string;
  assetSymbol: string;
  type: 'CAPITAL_GAIN' | 'DIVIDEND';
  amount: number;
  taxAmount: number;
  date: Date;
}

// WebSocket Event Types
export enum WebSocketEvent {
  PRICE_UPDATE = 'PRICE_UPDATE',
  PORTFOLIO_UPDATE = 'PORTFOLIO_UPDATE',
  ALERT_TRIGGERED = 'ALERT_TRIGGERED',
}

export interface WebSocketMessage<T = any> {
  event: WebSocketEvent;
  data: T;
  timestamp: Date;
}
