// API Endpoints
export const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

// Refresh intervals (in ms)
export const BALANCE_REFRESH_INTERVAL = 5000; // 5 seconds - real-time
export const ETH_PRICE_REFRESH_INTERVAL = 5000; // 5 seconds

// Chain config
export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = 'https://mainnet.base.org';

// UI Constants
export const DEFAULT_DECIMALS = 4;
export const USD_DECIMALS = 2;

// Copy to clipboard timeout
export const COPY_TIMEOUT = 2000;

// Animation durations (in ms)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export default {
  COINGECKO_API,
  BALANCE_REFRESH_INTERVAL,
  ETH_PRICE_REFRESH_INTERVAL,
  BASE_CHAIN_ID,
  BASE_RPC_URL,
  DEFAULT_DECIMALS,
  USD_DECIMALS,
  COPY_TIMEOUT,
  ANIMATION_DURATION,
};