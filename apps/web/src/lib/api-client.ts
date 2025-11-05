import { GraphQLClient } from 'graphql-request';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

class ApiClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(API_URL, {
      credentials: 'include',
    });
  }

  setAuthToken(token: string) {
    this.client.setHeader('authorization', `Bearer ${token}`);
  }

  clearAuthToken() {
    this.client.setHeader('authorization', '');
  }

  async request<T = any>(query: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(query);
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
