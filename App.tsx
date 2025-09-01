import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingScreen } from './src/components/onboarding/OnboardingScreen';
import { ResponsiveNavigation } from './src/components/navigation/ResponsiveNavigation';
import { MobileViewport } from './src/components/layout/MobileViewport';
import { DashboardPage } from './src/components/pages/DashboardPage';
import { ResponsiveTransactions } from './src/components/ResponsiveTransactions';
import Analytics from './src/components/Analytics';
import { WalletPage } from './src/components/pages/WalletPage';
import { Budget } from './src/components/Budget';
import { Goals } from './src/components/Goals';
import { NotificationsPage } from './src/components/pages/NotificationsPage';
import { ProfilePage } from './src/components/pages/ProfilePage';
import { LoadingSkeleton } from './src/components/common/LoadingSkeleton';

function AppContent() {
  const { state, dispatch } = useApp();
  const [isAuthenticated, setIsAuthenticated] = React.useState(true); // Set to true for testing
  const { transactions, budgets, goals } = useMockData();

  const handleOnboardingComplete = React.useCallback(() => {
    setIsAuthenticated(true);
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' });
  }, [dispatch]);

  const handlePageChange = React.useCallback((page: string) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, [dispatch]);

  const renderPage = React.useCallback(() => {
    switch (state.currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return (
          <Suspense fallback={<LoadingSkeleton variant="transactions" />}>
            <ResponsiveTransactions />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingSkeleton variant="analytics" />}>
            <Analytics />
          </Suspense>
        );
      case 'wallet':
        return <WalletPage />;
      case 'budget':
        return (
          <Suspense fallback={<LoadingSkeleton variant="budget" />}>
            <Budget />
          </Suspense>
        );
      case 'goals':
        return (
          <Suspense fallback={<LoadingSkeleton variant="goals" />}>
            <Goals />
          </Suspense>
        );
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  }, [state.currentPage]);

  // Show onboarding for new users
  if (!isAuthenticated) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <MobileViewport />
      <div className="mobile-layout md:h-screen md:flex bg-background">
        <ErrorBoundary>
          <ResponsiveNavigation 
            activeTab={state.currentPage} 
            onTabChange={handlePageChange} 
          />
        </ErrorBoundary>
      
      <main className="mobile-content md:flex-1 md:overflow-y-auto scroll-smooth">
        <div className="container-mobile spacing-mobile spacing-tablet spacing-desktop">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}