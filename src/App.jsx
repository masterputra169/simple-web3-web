import React, { lazy, Suspense } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';

// Lazy load components untuk reduce initial bundle
const Header = lazy(() => import('./components/organisms/Header'));
const MainContent = lazy(() => import('./components/organisms/MainContent'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <PrivyProvider
      appId="cmi3a1m6e024vl40cwtc1kdwj"
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#0052FF',
        },
        defaultChain: base,
        supportedChains: [base],
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Suspense fallback={<LoadingFallback />}>
          <Header />
          <MainContent />
        </Suspense>
      </div>
    </PrivyProvider>
  );
}

export default App;