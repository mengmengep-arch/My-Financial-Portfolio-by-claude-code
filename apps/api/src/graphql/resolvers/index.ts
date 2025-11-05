import { GraphQLScalarType, Kind } from 'graphql';
import { Decimal } from '@prisma/client/runtime/library';
import { authResolvers } from './auth';
import { portfolioResolvers } from './portfolio';
import { transactionResolvers } from './transaction';
import { analyticsResolvers } from './analytics';

// Custom scalar for DateTime
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom scalar for Decimal
const DecimalScalar = new GraphQLScalarType({
  name: 'Decimal',
  description: 'Decimal custom scalar type',
  serialize(value: any) {
    if (value instanceof Decimal) {
      return parseFloat(value.toString());
    }
    return parseFloat(value);
  },
  parseValue(value: any) {
    return new Decimal(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return new Decimal(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,
  Decimal: DecimalScalar,

  Query: {
    ...authResolvers.Query,
    ...portfolioResolvers.Query,
    ...transactionResolvers.Query,
    ...analyticsResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...portfolioResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },

  Portfolio: {
    holdings: async (parent: any, _args: any, context: any) => {
      return context.prisma.holding.findMany({
        where: { portfolioId: parent.id },
        include: { asset: true },
      });
    },
    transactions: async (parent: any, _args: any, context: any) => {
      return context.prisma.transaction.findMany({
        where: { portfolioId: parent.id },
        include: { asset: true },
        orderBy: { transactionDate: 'desc' },
        take: 50,
      });
    },
    value: async (parent: any, _args: any, context: any) => {
      const { calculatePortfolioValue } = await import('@financial-portfolio/database');
      return calculatePortfolioValue(parent.id);
    },
  },

  Holding: {
    asset: async (parent: any, _args: any, context: any) => {
      return context.prisma.asset.findUnique({
        where: { id: parent.assetId },
      });
    },
  },

  Transaction: {
    asset: async (parent: any, _args: any, context: any) => {
      return context.prisma.asset.findUnique({
        where: { id: parent.assetId },
      });
    },
  },
};
