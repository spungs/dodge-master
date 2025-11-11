/**
 * Input Validation Module
 * Validates user inputs for security and data integrity
 */

/**
 * Validate player name
 * @param {string} name - Player name
 * @returns {{valid: boolean, value?: string, error?: string}}
 */
function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }

  const trimmedName = name.trim();

  // Length validation
  if (trimmedName.length < 1) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (trimmedName.length > 20) {
    return { valid: false, error: 'Name must be 20 characters or less' };
  }

  // Character validation (alphanumeric, Korean, spaces, underscore, hyphen)
  const validNameRegex = /^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s_-]+$/;
  if (!validNameRegex.test(trimmedName)) {
    return {
      valid: false,
      error: 'Name can only contain letters, numbers, Korean characters, spaces, _ and -'
    };
  }

  return { valid: true, value: trimmedName };
}

/**
 * Validate survival time
 * @param {number} time - Survival time in seconds
 * @returns {{valid: boolean, value?: number, error?: string}}
 */
function validateSurvivalTime(time) {
  // Type validation
  if (typeof time !== 'number' || isNaN(time)) {
    return { valid: false, error: 'Time must be a valid number' };
  }

  // Range validation
  if (time < 0) {
    return { valid: false, error: 'Time cannot be negative' };
  }

  // Maximum time validation (10 minutes = 600 seconds)
  if (time > 600) {
    return { valid: false, error: 'Time exceeds maximum limit (10 minutes)' };
  }

  // Round to 3 decimal places
  const roundedTime = Math.round(time * 1000) / 1000;

  return { valid: true, value: roundedTime };
}

/**
 * Validate country code
 * @param {string} code - 2-letter country code
 * @returns {{valid: boolean, value?: string, error?: string}}
 */
function validateCountryCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Country code must be a string' };
  }

  const upperCode = code.toUpperCase().trim();

  // Length validation
  if (upperCode.length !== 2) {
    return { valid: false, error: 'Country code must be exactly 2 characters' };
  }

  // Character validation (only letters)
  if (!/^[A-Z]{2}$/.test(upperCode)) {
    return { valid: false, error: 'Country code must contain only letters' };
  }

  return { valid: true, value: upperCode };
}

/**
 * Validate month format
 * @param {string} month - Month in YYYY-MM format
 * @returns {{valid: boolean, value?: string, error?: string}}
 */
function validateMonth(month) {
  if (!month || typeof month !== 'string') {
    return { valid: false, error: 'Month must be a string' };
  }

  // Format validation
  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!monthRegex.test(month)) {
    return { valid: false, error: 'Month must be in YYYY-MM format' };
  }

  return { valid: true, value: month };
}

module.exports = {
  validatePlayerName,
  validateSurvivalTime,
  validateCountryCode,
  validateMonth
};
