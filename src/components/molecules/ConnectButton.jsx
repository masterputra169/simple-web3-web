import React, { memo, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import { WalletIcon, DisconnectIcon } from '../atoms/icons';
import CopyButton from './CopyButton';
import { truncateAddress } from '../../utils/formatBalance';

const ConnectButton = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const formattedAddress = useMemo(() => {
    return truncateAddress(walletAddress);
  }, [walletAddress]);

  // Not ready state
  if (!ready) {
    return (
      <Button variant="secondary" size="md" loading disabled>
        Connecting...
      </Button>
    );
  }

  // Connected state
  if (authenticated && walletAddress) {
    return (
      <div className="flex items-center gap-3">
        {/* Address Display */}
        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 group cursor-pointer hover:bg-white/10 transition-colors">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <Text variant="small" className="font-mono">
            {formattedAddress}
          </Text>
          <CopyButton text={walletAddress} size={14} />
        </div>

        {/* Disconnect Button */}
        <Button
          onClick={logout}
          variant="ghost"
          size="md"
          className="!p-2"
          title="Disconnect"
        >
          <DisconnectIcon size={18} />
        </Button>
      </div>
    );
  }

  // Disconnected state
  return (
    <Button onClick={login} variant="primary" size="md">
      <WalletIcon size={18} />
      Connect Wallet
    </Button>
  );
};

export default memo(ConnectButton);