import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, PieChart, BarChart3, DollarSign } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Financial Portfolio Manager
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional-grade portfolio management application for tracking investments,
            analyzing performance, and optimizing your financial strategy.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-Time Tracking</CardTitle>
              <CardDescription>
                Monitor your portfolio value with live market data updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <PieChart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>
                Visualize and optimize your investment distribution
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track returns, risk metrics, and compare with benchmarks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Tax Optimization</CardTitle>
              <CardDescription>
                Minimize tax liabilities with intelligent selling strategies
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Features Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Phase 1 MVP Features</CardTitle>
            <CardDescription>
              Currently available features in the first release
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>User authentication with 2FA support</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Manual portfolio and transaction entry</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>OCR support for Thai broker screenshots (Streaming, Settrade)</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Interactive dashboard with portfolio value and allocation charts</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Basic performance calculations (returns, profit/loss)</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Support for Thai and international stocks, funds, ETFs</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Financial Portfolio Manager - Phase 1 MVP</p>
          <p className="text-sm mt-2">Built with Next.js, PostgreSQL, and Prisma</p>
        </div>
      </footer>
    </div>
  );
}
