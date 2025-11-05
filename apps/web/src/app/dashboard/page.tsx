'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { GET_PORTFOLIOS_QUERY, CREATE_PORTFOLIO_MUTATION } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@financial-portfolio/utils';

interface Portfolio {
  id: string;
  name: string;
  baseCurrency: string;
  isDefault: boolean;
  value?: {
    totalValue: number;
    totalCost: number;
    totalGain: number;
    totalGainPercent: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        apiClient.setAuthToken(token);
      }

      const data: any = await apiClient.request(GET_PORTFOLIOS_QUERY);
      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPortfolio = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        apiClient.setAuthToken(token);
      }

      await apiClient.request(CREATE_PORTFOLIO_MUTATION, {
        name: 'My Portfolio',
        baseCurrency: 'THB',
      });

      await loadPortfolios();
    } catch (error) {
      console.error('Failed to create portfolio:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.email?.split('@')[0]}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your investment portfolio
        </p>
      </div>

      {/* Portfolios Section */}
      {portfolios.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your first portfolio to start tracking your investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createDefaultPortfolio} disabled={creating}>
              <Plus className="h-4 w-4 mr-2" />
              {creating ? 'Creating...' : 'Create My First Portfolio'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    portfolios.reduce((sum, p) => sum + (p.value?.totalValue || 0), 0),
                    'THB'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Across all portfolios</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    portfolios.reduce((sum, p) => sum + (p.value?.totalGain || 0), 0),
                    'THB'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {portfolios.reduce((sum, p) => sum + (p.value?.totalGainPercent || 0), 0).toFixed(2)}% overall
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolios</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolios.length}</div>
                <p className="text-xs text-muted-foreground">Active portfolios</p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Portfolios</h2>
              <Button onClick={createDefaultPortfolio} disabled={creating} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Portfolio
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{portfolio.name}</CardTitle>
                      {portfolio.isDefault && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <CardDescription>Currency: {portfolio.baseCurrency}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {portfolio.value ? (
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Value</div>
                          <div className="text-2xl font-bold">
                            {formatCurrency(portfolio.value.totalValue, portfolio.baseCurrency)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {portfolio.value.totalGain >= 0 ? (
                            <ArrowUp className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-destructive" />
                          )}
                          <span
                            className={
                              portfolio.value.totalGain >= 0 ? 'text-success' : 'text-destructive'
                            }
                          >
                            {formatCurrency(portfolio.value.totalGain, portfolio.baseCurrency)} (
                            {portfolio.value.totalGainPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No transactions yet. Add your first transaction to see portfolio value.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button variant="outline">
            <Wallet className="h-4 w-4 mr-2" />
            View All Holdings
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
