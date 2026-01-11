import React, { lazy, Suspense, useEffect, useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfig } from './config/privy';
import Spinner from './components/atoms/Spinner';
import { getGlobalEthPrice } from './hooks/useEthPrice';

// Lazy load components
const Header = lazy(() => import('./components/organisms/Header'));
const MainContent = lazy(() => import('./components/organisms/MainContent'));
const Footer = lazy(() => import('./components/organisms/Footer'));

// Loading screen component - centered
const LoadingScreen = ({ message = 'Loading Base DApp...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <div className="flex flex-col items-center justify-center">
      <Spinner size="lg" color="white" />
      <p className="mt-4 text-white/70 text-sm text-center">{message}</p>
    </div>
  </div>
);

function App() {
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    // Tunggu sampai WebSocket connect dan dapat harga pertama
    const checkDataReady = () => {
      if (getGlobalEthPrice()) {
        setIsDataReady(true);
        return;
      }
      // Retry setiap 100ms
      setTimeout(checkDataReady, 100);
    };

    // Timeout 5 detik - jika gagal, tetap lanjut
    const timeout = setTimeout(() => {
      setIsDataReady(true);
    }, 5000);

    checkDataReady();

    return () => clearTimeout(timeout);
  }, []);

  // Show loading sampai data ready
  if (!isDataReady) {
    return <LoadingScreen message="Connecting to market data..." />;
  }

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
        <Suspense fallback={<LoadingScreen />}>
          <Header />
          <MainContent />
          <Footer />
        </Suspense>
      </div>
    </PrivyProvider>
  );
}

export default App;