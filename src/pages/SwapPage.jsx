import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import Text from '../components/atoms/Text';
import Button from '../components/atoms/Button';
import SwapCard from '../components/organisms/SwapCard';
import EthPriceDisplay from '../components/molecules/EthPriceDisplay';
import { WalletIcon } from '../components/atoms/icons';

// Back Arrow Icon
const BackIcon = memo(({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
));

// Swap Icon Component
const SwapIconLarge = memo(() => (
  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/25">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4M7 4L3 8M7 4L11 8" />
      <path d="M17 8V20M17 20L21 16M17 20L13 16" />
    </svg>
  </div>
));

const SwapPage = () => {
  const { authenticated, login } = usePrivy();

  return (
    <div className="min-h-[calc(100vh-180px)] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-lg mx-auto mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <BackIcon size={18} />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          
          <div className="text-center">
            <SwapIconLarge />
            <Text variant="h2" className="mb-2 gradient-text">
              Token Swap
            </Text>
            <Text variant="body" color="muted">
              Exchange tokens at the best rates on Base network
            </Text>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          {authenticated ? (
            <>
              <SwapCard />
              
            </>
          ) : (
            /* Not Connected State */
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center pulse-glow">
                <WalletIcon size={32} className="text-white" />
              </div>
              
              <Text variant="h4" className="mb-3">
                Connect to Swap
              </Text>
              <Text color="muted" className="mb-6">
                Connect your wallet to start swapping tokens on Base network
              </Text>
              
              <Button onClick={login} variant="primary" size="lg" className="w-full">
                <WalletIcon size={20} />
                Connect Wallet
              </Button>

              {/* Features List */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-1">🔒</div>
                    <Text variant="tiny" color="muted">Secure</Text>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">⚡</div>
                    <Text variant="tiny" color="muted">Fast</Text>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">💰</div>
                    <Text variant="tiny" color="muted">Best Rates</Text>
                  </div>
                </div>
              </div>

              {/* ETH Price */}
              <div className="mt-6 flex justify-center">
                <EthPriceDisplay variant="compact" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(SwapPage);