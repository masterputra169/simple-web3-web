import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfig } from './config/privy';
import Spinner from './components/atoms/Spinner';
import { getGlobalEthPrice } from './hooks/useEthPrice';

// Lazy load components
const Header = lazy(() => import('./components/organisms/Header'));
const Footer = lazy(() => import('./components/organisms/Footer'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SwapPage = lazy(() => import('./pages/SwapPage'));

// Loading screen component
const LoadingScreen = ({ message = 'Loading Base DApp...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <div className="flex flex-col items-center justify-center">
      <Spinner size="lg" color="white" />
      <p className="mt-4 text-white/70 text-sm text-center">{message}</p>
    </div>
  </div>
);

// Page Loading Spinner
const PageLoader = () => (
  <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
    <Spinner size="lg" color="blue" />
  </div>
);

// Router wrapper component
const AppRouter = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      <Suspense fallback={<LoadingScreen />}>
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/swap" element={<SwapPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </Suspense>
    </div>
  );
};

function App() {
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    const checkDataReady = () => {
      if (getGlobalEthPrice()) {
        setIsDataReady(true);
        return;
      }
      setTimeout(checkDataReady, 100);
    };

    const timeout = setTimeout(() => {
      setIsDataReady(true);
    }, 5000);

    checkDataReady();

    return () => clearTimeout(timeout);
  }, []);

  if (!isDataReady) {
    return <LoadingScreen message="Connecting to market data..." />;
  }

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </PrivyProvider>
  );
}

export default App;