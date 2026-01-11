import React, { memo, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import WalletCard from './WalletCard';
import FeatureCard from './FeatureCard';
import EthPriceDisplay from '../molecules/EthPriceDisplay';
import { WalletIcon } from '../atoms/icons';
import useWalletBalance, { prefetchBalance } from '../../hooks/useWalletBalance';

// Hero Section
const HeroSection = memo(() => (
  <div className="text-center mb-12">
    <Text variant="h1" className="mb-4 gradient-text">
      Welcome to Base DApp
    </Text>
    <Text variant="body" color="muted" className="text-lg max-w-2xl mx-auto">
      Connect your wallet to interact with the Base blockchain.
      Fast, secure, and built for the future.
    </Text>
  </div>
));

// Connected View
const ConnectedView = memo(({ walletAddress, balance, rawBalance, isLoading, error, refetch }) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <WalletCard
      walletAddress={walletAddress}
      balance={balance}
      rawBalance={rawBalance}
      isLoading={isLoading}
      error={error}
      onRefresh={refetch}
    />
    <FeatureCard />
  </div>
));

// Disconnected View
const DisconnectedView = memo(({ onConnect }) => (
  <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto">
    {/* Icon */}
    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center pulse-glow">
      <WalletIcon size={40} className="text-white" />
    </div>

    {/* Content */}
    <Text variant="h3" className="mb-4">
      Connect Your Wallet
    </Text>
    <Text color="muted" className="mb-8">
      To get started, connect your Web3 wallet. We support MetaMask,
      Coinbase Wallet, and other popular wallets.
    </Text>

    {/* Connect Button */}
    <div className="flex justify-center">
      <Button onClick={onConnect} variant="primary" size="lg" className="w-full sm:w-auto">
        <WalletIcon size={20} />
        Connect Wallet
      </Button>
    </div>

    {/* ETH Price - Already loaded */}
    <div className="mt-8 flex justify-center">
      <EthPriceDisplay variant="compact" />
    </div>
  </div>
));

// Main Content Component
const MainContent = () => {
  const { authenticated, user, login, ready } = usePrivy();
  const walletAddress = user?.wallet?.address;
  const { balance, rawBalance, isLoading, error, refetch } = useWalletBalance(walletAddress);

  // Pre-fetch balance saat wallet address tersedia
  useEffect(() => {
    if (walletAddress) {
      prefetchBalance(walletAddress);
    }
  }, [walletAddress]);

  return (
    <main className="container mx-auto px-4 py-12 min-h-[calc(100vh-180px)] flex-1">
      <div className="max-w-5xl mx-auto">
        <HeroSection />
        
        {authenticated && walletAddress ? (
          <ConnectedView
            walletAddress={walletAddress}
            balance={balance}
            rawBalance={rawBalance}
            isLoading={isLoading}
            error={error}
            refetch={refetch}
          />
        ) : (
          <DisconnectedView onConnect={login} />
        )}
      </div>
    </main>
  );
};

export default memo(MainContent);