import React, { memo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Text from '../atoms/Text';
import WalletInfo from '../molecules/WalletInfo';
import Button from '../atoms/Button';
import EthPriceDisplay from '../molecules/EthPriceDisplay';
import useWalletBalance from '../../hooks/useWalletBalance';

// Memoize sub-components
const WelcomeSection = memo(() => (
  <div className="text-center mb-12">
    <Text variant="h1" className="mb-4">
      Welcome to Base DApp
    </Text>
    <Text variant="body" color="muted" className="text-lg">
      Connect your wallet to interact with Base blockchain
    </Text>
  </div>
));

const ConnectedView = memo(({ walletAddress, balance, isLoading, error, refetch }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <Text variant="h3">Your Wallet</Text>
        <Button 
          onClick={refetch} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '🔄 Refresh'}
        </Button>
      </div>
      
      <WalletInfo 
        address={walletAddress} 
        balance={balance}
        isLoading={isLoading}
      />
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text variant="small" color="muted">
            ⚠️ Error: {error}
          </Text>
        </div>
      )}

      {/* ETH Price Display */}
      <div className="mt-4">
        <EthPriceDisplay variant="detailed" />
      </div>
    </div>

    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 shadow-lg text-white">
      <Text variant="h3" color="white" className="mb-4">
        Ready to Build
      </Text>
      <Text color="white" className="mb-6">
        Your wallet is connected to Base blockchain. Balance updates automatically every 30 seconds. USD value updates every 60 seconds.
      </Text>
      <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
        Explore Features
      </Button>
    </div>
  </div>
));

const DisconnectedView = memo(() => (
  <div className="bg-white rounded-xl p-12 shadow-lg text-center">
    <div className="max-w-md mx-auto">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      </div>
      <Text variant="h3" className="mb-4">
        Connect Your Wallet
      </Text>
      <Text color="muted" className="mb-6">
        To get started, please connect your Web3 wallet using the button in the top right corner.
      </Text>
      
      {/* Show ETH price even when disconnected */}
      <div className="mt-6 flex justify-center">
        <EthPriceDisplay variant="compact" />
      </div>
    </div>
  </div>
));

const MainContent = () => {
  const { authenticated, user } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const { balance, isLoading, error, refetch } = useWalletBalance(walletAddress);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <WelcomeSection />
        {authenticated ? (
          <ConnectedView 
            walletAddress={walletAddress}
            balance={balance}
            isLoading={isLoading}
            error={error}
            refetch={refetch}
          />
        ) : (
          <DisconnectedView />
        )}
      </div>
    </main>
  );
};

export default memo(MainContent);