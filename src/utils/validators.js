/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean}
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate if balance is valid number
 * @param {string|number} balance - Balance to validate
 * @returns {boolean}
 */
export const isValidBalance = (balance) => {
  if (!balance && balance !== 0) return false;
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return !isNaN(num) && num >= 0;
};

/**
 * Validate positive number
 * @param {string|number} value - Value to validate
 * @returns {boolean}
 */
export const isPositiveNumber = (value) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Check if value is empty or null
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '';
};

export default {
  isValidAddress,
  isValidBalance,
  isPositiveNumber,
  isEmpty,
};