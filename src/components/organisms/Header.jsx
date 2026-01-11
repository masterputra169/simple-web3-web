import React, { memo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ConnectButton from '../molecules/ConnectButton';
import NetworkBadge from '../molecules/NetworkBadge';
import Text from '../atoms/Text';
import { BaseLogoIcon } from '../atoms/icons';

const Header = () => {
  const { authenticated } = usePrivy();

  return (
    <header className="glass-dark sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                <BaseLogoIcon size={28} />
              </div>
              <div>
                <Text variant="h4" className="font-bold">
                  Base DApp
                </Text>
                <Text variant="tiny" color="muted" className="hidden sm:block">
                  Built on Base
                </Text>
              </div>
            </div>

            {/* Network Badge */}
            <div className="hidden md:block">
              <NetworkBadge isConnected={authenticated} />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">


            {/* Connect Button */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);