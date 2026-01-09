/**
 * Format balance utilities
 * Reusable formatting functions untuk consistency
 */

/**
 * Format ETH balance dengan jumlah desimal spesifik
 * @param {string|number} balance - Balance dalam ETH
 * @param {number} decimals - Jumlah desimal (default: 4)
 * @returns {string} - Formatted balance
 */
export const formatEthBalance = (balance, decimals = 4) => {
  if (!balance || balance === '0' || balance === 0) {
    return '0.' + '0'.repeat(decimals);
  }
  
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return num.toFixed(decimals);
};

/**
 * Format balance dengan thousand separator
 * @param {string|number} balance - Balance dalam ETH
 * @param {number} decimals - Jumlah desimal (default: 4)
 * @returns {string} - Formatted balance dengan comma separator
 * 
 * Example: 1234.5678 -> "1,234.5678"
 */
export const formatEthBalanceWithComma = (balance, decimals = 4) => {
  if (!balance || balance === '0' || balance === 0) {
    return '0.' + '0'.repeat(decimals);
  }
  
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  const parts = num.toFixed(decimals).split('.');
  
  // Add thousand separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return parts.join('.');
};

/**
 * Format balance dengan custom suffix
 * @param {string|number} balance - Balance
 * @param {string} suffix - Currency symbol (default: 'ETH')
 * @param {number} decimals - Jumlah desimal (default: 4)
 * @returns {string} - Formatted balance dengan suffix
 * 
 * Example: formatWithSuffix(1.2345, 'ETH', 4) -> "1.2345 ETH"
 */
export const formatWithSuffix = (balance, suffix = 'ETH', decimals = 4) => {
  const formatted = formatEthBalance(balance, decimals);
  return `${formatted} ${suffix}`;
};

/**
 * Shorten large balance dengan K, M, B suffix
 * @param {string|number} balance - Balance
 * @param {number} decimals - Jumlah desimal (default: 2)
 * @returns {string} - Shortened balance
 * 
 * Example: 
 * 1234 -> "1.23K"
 * 1234567 -> "1.23M"
 * 1234567890 -> "1.23B"
 */
export const shortenBalance = (balance, decimals = 2) => {
  if (!balance || balance === '0' || balance === 0) return '0';
  
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
};

/**
 * Format USD value
 * @param {string|number} ethBalance - Balance dalam ETH
 * @param {number} ethPriceUSD - Harga ETH dalam USD
 * @param {number} decimals - Jumlah desimal (default: 2)
 * @returns {string} - Formatted USD value
 * 
 * Example: formatUSD(1.5, 2000, 2) -> "$3,000.00"
 */
export const formatUSD = (ethBalance, ethPriceUSD, decimals = 2) => {
  if (!ethBalance || !ethPriceUSD) return '$0.00';
  
  const ethNum = typeof ethBalance === 'string' ? parseFloat(ethBalance) : ethBalance;
  const usdValue = ethNum * ethPriceUSD;
  
  return '$' + formatEthBalanceWithComma(usdValue, decimals);
};

/**
 * Validate if balance is valid number
 * @param {string|number} balance - Balance to validate
 * @returns {boolean} - True if valid
 */
export const isValidBalance = (balance) => {
  if (!balance && balance !== 0) return false;
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return !isNaN(num) && num >= 0;
};

export default {
  formatEthBalance,
  formatEthBalanceWithComma,
  formatWithSuffix,
  shortenBalance,
  formatUSD,
  isValidBalance,
};