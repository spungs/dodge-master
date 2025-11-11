/**
 * Validation Module Tests
 * Testing input validation functions
 */

const {
  validatePlayerName,
  validateSurvivalTime,
  validateCountryCode,
  validateMonth
} = require('../src/validation');

describe('Validation', () => {
  describe('validatePlayerName', () => {
    test('should accept valid player names', () => {
      expect(validatePlayerName('John')).toEqual({ valid: true, value: 'John' });
      expect(validatePlayerName('김철수')).toEqual({ valid: true, value: '김철수' });
      expect(validatePlayerName('Player_123')).toEqual({ valid: true, value: 'Player_123' });
      expect(validatePlayerName('Test-Player')).toEqual({ valid: true, value: 'Test-Player' });
    });

    test('should trim whitespace', () => {
      expect(validatePlayerName('  John  ')).toEqual({ valid: true, value: 'John' });
    });

    test('should reject names that are too short', () => {
      const result = validatePlayerName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject names that are too long', () => {
      const longName = 'a'.repeat(21);
      const result = validatePlayerName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject invalid characters', () => {
      expect(validatePlayerName('<script>')).toEqual({ valid: false, error: expect.any(String) });
      expect(validatePlayerName('Test@User')).toEqual({ valid: false, error: expect.any(String) });
    });

    test('should reject non-string inputs', () => {
      expect(validatePlayerName(null).valid).toBe(false);
      expect(validatePlayerName(undefined).valid).toBe(false);
      expect(validatePlayerName(123).valid).toBe(false);
    });
  });

  describe('validateSurvivalTime', () => {
    test('should accept valid survival times', () => {
      expect(validateSurvivalTime(30.456)).toEqual({ valid: true, value: 30.456 });
      expect(validateSurvivalTime(0.001)).toEqual({ valid: true, value: 0.001 });
      expect(validateSurvivalTime(599.999)).toEqual({ valid: true, value: 599.999 });
    });

    test('should round to 3 decimal places', () => {
      expect(validateSurvivalTime(30.123456)).toEqual({ valid: true, value: 30.123 });
    });

    test('should reject negative times', () => {
      const result = validateSurvivalTime(-1);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject unrealistic times', () => {
      const result = validateSurvivalTime(601);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject non-number inputs', () => {
      expect(validateSurvivalTime('30').valid).toBe(false);
      expect(validateSurvivalTime(null).valid).toBe(false);
      expect(validateSurvivalTime(NaN).valid).toBe(false);
    });
  });

  describe('validateCountryCode', () => {
    test('should accept valid 2-letter country codes', () => {
      expect(validateCountryCode('KR')).toEqual({ valid: true, value: 'KR' });
      expect(validateCountryCode('US')).toEqual({ valid: true, value: 'US' });
      expect(validateCountryCode('JP')).toEqual({ valid: true, value: 'JP' });
    });

    test('should convert lowercase to uppercase', () => {
      expect(validateCountryCode('kr')).toEqual({ valid: true, value: 'KR' });
    });

    test('should reject codes with wrong length', () => {
      expect(validateCountryCode('K').valid).toBe(false);
      expect(validateCountryCode('KOR').valid).toBe(false);
    });

    test('should reject non-string inputs', () => {
      expect(validateCountryCode(null).valid).toBe(false);
      expect(validateCountryCode(123).valid).toBe(false);
    });

    test('should reject codes with non-letters', () => {
      expect(validateCountryCode('K1').valid).toBe(false);
    });
  });

  describe('validateMonth', () => {
    test('should accept valid month formats', () => {
      expect(validateMonth('2025-11')).toEqual({ valid: true, value: '2025-11' });
      expect(validateMonth('2024-01')).toEqual({ valid: true, value: '2024-01' });
      expect(validateMonth('2024-12')).toEqual({ valid: true, value: '2024-12' });
    });

    test('should reject invalid formats', () => {
      expect(validateMonth('2025-1').valid).toBe(false);
      expect(validateMonth('25-11').valid).toBe(false);
      expect(validateMonth('2025/11').valid).toBe(false);
      expect(validateMonth('2025').valid).toBe(false);
    });

    test('should reject invalid months', () => {
      expect(validateMonth('2025-00').valid).toBe(false);
      expect(validateMonth('2025-13').valid).toBe(false);
    });

    test('should reject non-string inputs', () => {
      expect(validateMonth(null).valid).toBe(false);
      expect(validateMonth(202511).valid).toBe(false);
    });
  });
});
