import { useState, useEffect, useMemo } from 'react';
import { BASE_CHAIN_ID } from '../utils/constants';

/**
 * Hook untuk check network status
 * @param {number} currentChainId - Current chain ID from wallet
 * @returns {Object}
 */
const useNetworkStatus = (currentChainId) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return useMemo(() => ({
    isOnline,
    isCorrectNetwork: currentChainId === BASE_CHAIN_ID,
    networkName: currentChainId === BASE_CHAIN_ID ? 'Base' : 'Unknown',
    chainId: currentChainId,
  }), [isOnline, currentChainId]);
};

export default useNetworkStatus;