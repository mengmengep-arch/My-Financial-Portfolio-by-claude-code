# Financial Portfolio Management Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

A professional-grade Financial Portfolio Management Application for tracking investments, analyzing performance, and optimizing financial strategies. Built with modern technologies including Next.js, PostgreSQL, GraphQL, and AI-powered OCR.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Phase 1 MVP (Current)

- **User Authentication** - Secure authentication with JWT tokens and optional 2FA
- **Portfolio Management** - Create and manage multiple investment portfolios
- **Manual Transaction Entry** - Record buy/sell transactions with validation
- **OCR Support** - Extract portfolio data from Thai broker screenshots (Streaming, Settrade, KTB)
- **Real-time Dashboard** - Interactive charts showing portfolio value and asset allocation
- **Performance Analytics** - Basic calculations for returns, profit/loss, and risk metrics
- **Multi-currency Support** - Track investments in THB and other currencies
- **Asset Types** - Support for stocks, funds (RMF/SSF/LTF), ETFs, bonds, and more

### Coming Soon (Phase 2-4)

- Advanced analytics with AI-powered insights
- Tax optimization and reporting
- Goal-based planning tools
- Mobile applications (iOS/Android)
- Real-time price feeds and alerts
- Social features and portfolio sharing

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful UI components
- **React Query** - Data fetching and caching
- **Recharts** - Interactive data visualization
- **Socket.io Client** - Real-time updates

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Apollo Server** - GraphQL server
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **Socket.io** - WebSocket server
- **Winston** - Logging

### Services
- **Tesseract.js** - OCR processing
- **Google Vision API** - Advanced OCR
- **Sharp** - Image processing

### DevOps
- **Docker** - Containerization
- **Turbo** - Monorepo build system
- **ESLint & Prettier** - Code quality
- **GitHub Actions** - CI/CD (planned)

## 📁 Project Structure

```
financial-portfolio-app/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities and helpers
│   │   │   └── hooks/         # Custom React hooks
│   │   └── package.json
│   └── api/                    # Node.js backend API
│       ├── src/
│       │   ├── graphql/       # GraphQL schema and resolvers
│       │   ├── services/      # Business logic services
│       │   ├── middleware/    # Express middleware
│       │   └── utils/         # Utility functions
│       └── package.json
├── packages/
│   ├── database/              # Prisma schema and database utilities
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── src/
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Shared utility functions
│   └── ui/                    # Shared UI components
├── services/
│   ├── ocr-service/          # OCR processing service
│   └── market-data-service/  # Market data fetching (planned)
├── infrastructure/
│   └── docker/               # Docker configurations
│       ├── docker-compose.dev.yml
│       ├── Dockerfile.api
│       └── Dockerfile.web
├── .env.example              # Environment variables template
├── package.json              # Root package.json
├── turbo.json               # Turbo configuration
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** and **Docker Compose** (for containerized development)
- **PostgreSQL** 16+ (if not using Docker)
- **Redis** 7+ (if not using Docker)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd My-Financial-Portfolio-by-claude-code
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and fill in your configuration
nano .env
```

### 4. Start Docker Services

```bash
# Start PostgreSQL, Redis, and TimescaleDB
npm run docker:dev
```

### 5. Set Up Database

```bash
# Generate Prisma client
cd packages/database
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npm run seed
```

### 6. Start Development Servers

```bash
# In the root directory, start all services
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **PgAdmin**: http://localhost:5050

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start all services in development mode
npm run build        # Build all packages and apps
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio

# Docker
npm run docker:dev   # Start Docker services
```

### Working with the Monorepo

This project uses **Turborepo** for efficient monorepo management:

```bash
# Run commands in specific workspace
npm run dev --workspace=@financial-portfolio/web
npm run build --workspace=@financial-portfolio/api

# Add dependency to specific package
npm install <package> --workspace=@financial-portfolio/web
```

### Code Style

- **ESLint** and **Prettier** are configured for consistent code style
- Pre-commit hooks ensure code quality
- Use conventional commits for version control

```bash
# Run linting
npm run lint

# Auto-fix linting issues
npm run lint --fix

# Format code
npm run format
```

## 🗄️ Database Setup

### Using Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
npm run docker:dev
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- TimescaleDB on port 5433
- PgAdmin on port 5050

### Manual Setup

If you prefer manual installation:

1. **Install PostgreSQL 16+**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql-16

   # macOS
   brew install postgresql@16
   ```

2. **Create Database**
   ```bash
   createdb financial_portfolio
   ```

3. **Update .env**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/financial_portfolio"
   ```

4. **Run Migrations**
   ```bash
   cd packages/database
   npx prisma migrate dev
   ```

### Database Schema

The application uses the following main tables:

- `users` - User accounts and authentication
- `portfolios` - User portfolios
- `assets` - Stock, fund, and asset information
- `holdings` - Current portfolio positions
- `transactions` - Transaction history
- `price_history` - Historical price data (TimescaleDB)
- `portfolio_snapshots` - Daily portfolio snapshots

## 📚 API Documentation

### GraphQL API

The GraphQL API is available at `http://localhost:4000/graphql` in development.

#### Authentication

```graphql
# Sign Up
mutation SignUp {
  signUp(input: {
    email: "user@example.com"
    password: "secure_password"
  }) {
    user {
      id
      email
    }
    accessToken
    refreshToken
  }
}

# Sign In
mutation SignIn {
  signIn(input: {
    email: "user@example.com"
    password: "secure_password"
  }) {
    user {
      id
      email
    }
    accessToken
    refreshToken
  }
}
```

#### Portfolio Operations

```graphql
# Create Portfolio
mutation CreatePortfolio {
  createPortfolio(input: {
    name: "My Investment Portfolio"
    baseCurrency: "THB"
  }) {
    id
    name
    baseCurrency
  }
}

# Get Portfolios
query GetPortfolios {
  portfolios {
    id
    name
    baseCurrency
    value {
      totalValue
      totalGain
      totalGainPercent
    }
  }
}

# Add Transaction
mutation AddTransaction {
  addTransaction(input: {
    portfolioId: "portfolio-id"
    assetSymbol: "AAPL"
    assetName: "Apple Inc."
    assetType: "STOCK_US"
    exchange: "NASDAQ"
    transactionType: "BUY"
    quantity: 10
    price: 180.50
    fees: 5.00
    transactionDate: "2024-01-15T00:00:00Z"
  }) {
    id
    asset {
      symbol
      name
    }
    quantity
    price
  }
}
```

### REST Endpoints

- `GET /health` - Health check
- `POST /api/upload` - Upload files for OCR processing

## 🚢 Deployment

### Docker Production Build

```bash
# Build production images
docker build -f infrastructure/docker/Dockerfile.web -t financial-portfolio-web .
docker build -f infrastructure/docker/Dockerfile.api -t financial-portfolio-api .

# Run containers
docker run -p 3000:3000 financial-portfolio-web
docker run -p 4000:4000 financial-portfolio-api
```

### Environment Variables

Ensure all production environment variables are properly set:

- Database credentials
- JWT secrets
- API keys for OCR services
- CORS origins
- Redis configuration

### Database Migrations

```bash
# Run production migrations
cd packages/database
npx prisma migrate deploy
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Initial development by Claude Code

## 🙏 Acknowledgments

- Built with Next.js, Prisma, and Apollo GraphQL
- UI components from Shadcn/ui
- OCR powered by Tesseract.js and Google Vision API

---

**Note**: This is Phase 1 MVP. Additional features including mobile apps, AI insights, and advanced analytics are planned for future releases.
