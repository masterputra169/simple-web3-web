/**
 * Swap Configuration
 * Using 0x Swap API for secure token swaps on Base network
 */

// 0x API Configuration
export const ZEROX_API_URL = 'https://api.0x.org';
export const ZEROX_API_KEY = ''; // Get from https://dashboard.0x.org

// Base Network Chain ID
export const BASE_CHAIN_ID = 8453;

// AllowanceHolder Contract Address (for Base - Cancun hardfork)
// This is the contract users approve tokens to
export const ALLOWANCE_HOLDER_ADDRESS = '0x0000000000001fF3684f28c67538d4D072C22734';

// Popular tokens on Base Network
export const BASE_TOKENS = {
  ETH: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
  },
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  },
  USDbC: {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    symbol: 'USDbC',
    name: 'USD Base Coin',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  },
  DAI: {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png',
  },
  cbETH: {
    address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    symbol: 'cbETH',
    name: 'Coinbase Wrapped Staked ETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/27008/small/cbeth.png',
  },
};

// Default slippage tolerance (0.5%)
export const DEFAULT_SLIPPAGE_BPS = 50; // 50 basis points = 0.5%

// Max slippage tolerance (5%)
export const MAX_SLIPPAGE_BPS = 500;

// Min slippage tolerance (0.1%)
export const MIN_SLIPPAGE_BPS = 10;

// Transaction deadline (20 minutes)
export const TX_DEADLINE_MINUTES = 20;

// Gas buffer multiplier (add 20% to estimated gas)
export const GAS_BUFFER_MULTIPLIER = 1.2;

export default {
  ZEROX_API_URL,
  ZEROX_API_KEY,
  BASE_CHAIN_ID,
  ALLOWANCE_HOLDER_ADDRESS,
  BASE_TOKENS,
  DEFAULT_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  TX_DEADLINE_MINUTES,
  GAS_BUFFER_MULTIPLIER,
};