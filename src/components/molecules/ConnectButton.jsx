import React, { memo, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../atoms/Button';
import WalletIcon from '../atoms/WalletIcon';
import Text from '../atoms/Text';
import CopyButton from './CopyButton';

const ConnectButton = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  // Memoize formatted address
  const formattedAddress = useMemo(() => {
    if (!walletAddress) return '';
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  if (!ready) {
    return (
      <Button disabled variant="secondary" size="md">
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex items-center gap-2">
          <Text variant="small" className="font-mono">
            {formattedAddress}
          </Text>
          <CopyButton text={walletAddress} size={14} />
        </div>
        <Button onClick={logout} variant="outline" size="md">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={login} variant="primary" size="md" className="gap-2">
      <WalletIcon size={18} />
      Connect Wallet
    </Button>
  );
};

export default memo(ConnectButton);