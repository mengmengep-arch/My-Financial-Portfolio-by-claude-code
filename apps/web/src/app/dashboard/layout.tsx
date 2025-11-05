'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Wallet, TrendingUp, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="font-bold text-xl">
              Portfolio Manager
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/dashboard/portfolios" className="text-sm font-medium hover:text-primary flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Portfolios
              </Link>
              <Link href="/dashboard/transactions" className="text-sm font-medium hover:text-primary flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Transactions
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
