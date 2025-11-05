import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar Decimal

  type User {
    id: ID!
    email: String!
    twoFactorEnabled: Boolean!
    createdAt: DateTime!
    portfolios: [Portfolio!]!
  }

  type Portfolio {
    id: ID!
    userId: ID!
    name: String!
    baseCurrency: String!
    isDefault: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    holdings: [Holding!]!
    transactions: [Transaction!]!
    value: PortfolioValue
  }

  type Asset {
    id: ID!
    symbol: String!
    name: String!
    assetType: String!
    exchange: String
    sector: String
    industry: String
    currency: String!
    currentPrice: PriceData
  }

  type Holding {
    id: ID!
    portfolioId: ID!
    assetId: ID!
    quantity: Decimal!
    averageCost: Decimal!
    currentValue: Decimal
    totalGain: Decimal
    totalGainPercent: Decimal
    firstPurchaseDate: DateTime!
    lastUpdate: DateTime!
    asset: Asset!
  }

  type Transaction {
    id: ID!
    portfolioId: ID!
    assetId: ID!
    transactionType: String!
    quantity: Decimal!
    price: Decimal!
    fees: Decimal!
    transactionDate: DateTime!
    notes: String
    createdAt: DateTime!
    asset: Asset!
  }

  type PriceData {
    symbol: String!
    currentPrice: Decimal!
    change: Decimal!
    changePercent: Decimal!
    timestamp: DateTime!
  }

  type PortfolioValue {
    portfolioId: ID!
    totalValue: Decimal!
    totalCost: Decimal!
    totalGain: Decimal!
    totalGainPercent: Decimal!
    dailyChange: Decimal
    dailyChangePercent: Decimal
    timestamp: DateTime!
  }

  type AllocationItem {
    type: String!
    value: Decimal!
    percentage: Decimal!
    count: Int!
  }

  type AllocationData {
    portfolioId: ID!
    byAssetType: [AllocationItem!]!
    bySector: [AllocationItem!]!
    byGeography: [AllocationItem!]!
    cashPercentage: Decimal!
  }

  type PerformanceMetrics {
    portfolioId: ID!
    period: String!
    totalReturn: Decimal!
    totalReturnPercent: Decimal!
    timeWeightedReturn: Decimal!
    sharpeRatio: Decimal
    volatility: Decimal
    maxDrawdown: Decimal
  }

  type OCRResult {
    sessionId: ID!
    brokerType: String!
    confidence: Decimal!
    extractedData: [ExtractedHolding!]!
    requiresReview: Boolean!
  }

  type ExtractedHolding {
    symbol: String!
    quantity: Decimal!
    averageCost: Decimal!
    currentPrice: Decimal!
    confidence: Decimal!
  }

  type AuthResponse {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  # Inputs
  input SignUpInput {
    email: String!
    password: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input CreatePortfolioInput {
    name: String!
    baseCurrency: String
  }

  input UpdatePortfolioInput {
    name: String
    baseCurrency: String
    isDefault: Boolean
  }

  input TransactionInput {
    portfolioId: ID!
    assetSymbol: String!
    assetName: String!
    assetType: String!
    exchange: String
    transactionType: String!
    quantity: Decimal!
    price: Decimal!
    fees: Decimal
    transactionDate: DateTime!
    notes: String
  }

  # Queries
  type Query {
    me: User
    portfolio(id: ID!): Portfolio
    portfolios: [Portfolio!]!
    portfolioValue(portfolioId: ID!): PortfolioValue
    allocation(portfolioId: ID!): AllocationData
    performance(portfolioId: ID!, period: String!): PerformanceMetrics
    searchAssets(query: String!): [Asset!]!
    assetPrice(symbol: String!, exchange: String): PriceData
    transactions(portfolioId: ID!, limit: Int, offset: Int): [Transaction!]!
  }

  # Mutations
  type Mutation {
    signUp(input: SignUpInput!): AuthResponse!
    signIn(input: SignInInput!): AuthResponse!
    refreshToken(refreshToken: String!): AuthResponse!

    createPortfolio(input: CreatePortfolioInput!): Portfolio!
    updatePortfolio(id: ID!, input: UpdatePortfolioInput!): Portfolio!
    deletePortfolio(id: ID!): Boolean!

    addTransaction(input: TransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!

    processScreenshot(brokerType: String): OCRResult!
    confirmOCRData(sessionId: ID!, portfolioId: ID!): Portfolio!
  }

  # Subscriptions
  type Subscription {
    portfolioValueUpdate(portfolioId: ID!): PortfolioValue!
    priceUpdate(symbols: [String!]!): PriceData!
  }
`;
