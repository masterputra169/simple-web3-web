import { useState, useEffect, useCallback, useMemo } from 'react';

// CoinGecko API endpoint (Free, no API key needed)
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * Custom hook untuk fetch ETH price dari CoinGecko
 * @returns {Object} - { ethPrice, isLoading, error, refetch }
 */
const useEthPrice = () => {
  const [ethPrice, setEthPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEthPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${COINGECKO_API}?ids=ethereum&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch ETH price');
      }

      const data = await response.json();
      const price = data.ethereum?.usd;

      if (price) {
        setEthPrice(price);
      } else {
        throw new Error('Invalid price data');
      }
    } catch (err) {
      console.error('Error fetching ETH price:', err);
      setError(err.message);
      // Fallback price jika error
      setEthPrice(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately
    fetchEthPrice();

    // Auto-refresh every 60 seconds (CoinGecko rate limit friendly)
    const interval = setInterval(fetchEthPrice, 60000);

    return () => clearInterval(interval);
  }, [fetchEthPrice]);

  return useMemo(
    () => ({
      ethPrice,
      isLoading,
      error,
      refetch: fetchEthPrice,
    }),
    [ethPrice, isLoading, error, fetchEthPrice]
  );
};

export default useEthPrice;