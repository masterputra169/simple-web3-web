import { DEFAULT_DECIMALS } from './constants';

/**
 * Format ETH balance
 * @param {string|number} balance - Balance in ETH
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export const formatEthBalance = (balance, decimals = DEFAULT_DECIMALS) => {
  if (!balance || balance === '0' || balance === 0) {
    return '0.' + '0'.repeat(decimals);
  }
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return num.toFixed(decimals);
};

/**
 * Format balance with thousand separator
 * @param {string|number} balance - Balance
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export const formatWithComma = (balance, decimals = DEFAULT_DECIMALS) => {
  if (!balance || balance === '0' || balance === 0) {
    return '0.' + '0'.repeat(decimals);
  }
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  const parts = num.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

/**
 * Format with currency suffix
 * @param {string|number} balance - Balance
 * @param {string} suffix - Currency symbol
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export const formatWithSuffix = (balance, suffix = 'ETH', decimals = DEFAULT_DECIMALS) => {
  return `${formatEthBalance(balance, decimals)} ${suffix}`;
};

/**
 * Shorten large numbers with K, M, B suffix
 * @param {string|number} balance - Balance
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export const shortenBalance = (balance, decimals = 2) => {
  if (!balance || balance === '0' || balance === 0) return '0';
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  
  return num.toFixed(decimals);
};

/**
 * Truncate address for display
 * @param {string} address - Full address
 * @param {number} startChars - Characters from start
 * @param {number} endChars - Characters from end
 * @returns {string}
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export default {
  formatEthBalance,
  formatWithComma,
  formatWithSuffix,
  shortenBalance,
  truncateAddress,
};