export const SIGN_UP_MUTATION = `
  mutation SignUp($email: String!, $password: String!) {
    signUp(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
      accessToken
      refreshToken
    }
  }
`;

export const SIGN_IN_MUTATION = `
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
      accessToken
      refreshToken
    }
  }
`;

export const GET_ME_QUERY = `
  query GetMe {
    me {
      id
      email
      twoFactorEnabled
      createdAt
    }
  }
`;

export const GET_PORTFOLIOS_QUERY = `
  query GetPortfolios {
    portfolios {
      id
      name
      baseCurrency
      isDefault
      createdAt
      value {
        totalValue
        totalCost
        totalGain
        totalGainPercent
      }
    }
  }
`;

export const CREATE_PORTFOLIO_MUTATION = `
  mutation CreatePortfolio($name: String!, $baseCurrency: String) {
    createPortfolio(input: { name: $name, baseCurrency: $baseCurrency }) {
      id
      name
      baseCurrency
      isDefault
    }
  }
`;

export const ADD_TRANSACTION_MUTATION = `
  mutation AddTransaction($input: TransactionInput!) {
    addTransaction(input: $input) {
      id
      transactionType
      quantity
      price
      fees
      transactionDate
      asset {
        symbol
        name
      }
    }
  }
`;

export const GET_PORTFOLIO_VALUE_QUERY = `
  query GetPortfolioValue($portfolioId: ID!) {
    portfolioValue(portfolioId: $portfolioId) {
      portfolioId
      totalValue
      totalCost
      totalGain
      totalGainPercent
      dailyChange
      dailyChangePercent
      timestamp
    }
  }
`;

export const GET_ALLOCATION_QUERY = `
  query GetAllocation($portfolioId: ID!) {
    allocation(portfolioId: $portfolioId) {
      portfolioId
      byAssetType {
        type
        value
        percentage
        count
      }
      bySector {
        type
        value
        percentage
        count
      }
      cashPercentage
    }
  }
`;
