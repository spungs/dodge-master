/**
 * Database Module Tests
 * Following TDD principles: Write failing tests first, then implement
 */

const Database = require('../src/database');
const fs = require('fs');
const path = require('path');

describe('Database', () => {
  let db;
  const testDbPath = path.join(__dirname, 'test.db');

  beforeEach(() => {
    // Clean up test database before each test
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterEach(async () => {
    // Close database connection and clean up
    if (db) {
      await db.close();
    }
    // Wait a bit before deleting file
    await new Promise(resolve => setTimeout(resolve, 50));
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Database Initialization', () => {
    test('should create database file when initialized', async () => {
      db = new Database(testDbPath);
      // Wait a bit for database initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fs.existsSync(testDbPath)).toBe(true);
    });

    test('should create rankings table with correct schema', async () => {
      db = new Database(testDbPath);
      await new Promise(resolve => setTimeout(resolve, 100));
      const tableInfo = await db.getTableInfo('rankings');

      const expectedColumns = ['id', 'player_name', 'survival_time', 'country_code', 'month', 'created_at'];
      const actualColumns = tableInfo.map(col => col.name);

      expect(actualColumns).toEqual(expectedColumns);
    });

    test('should create indexes for month and survival_time', async () => {
      db = new Database(testDbPath);
      await new Promise(resolve => setTimeout(resolve, 100));
      const indexes = await db.getIndexes('rankings');

      const indexNames = indexes.map(idx => idx.name);
      expect(indexNames).toContain('idx_month');
      expect(indexNames).toContain('idx_survival_time');
    });
  });

  describe('getCurrentMonth', () => {
    test('should return current month in YYYY-MM format', () => {
      db = new Database(testDbPath);
      const month = db.getCurrentMonth();

      // Should match YYYY-MM pattern
      expect(month).toMatch(/^\d{4}-\d{2}$/);

      // Should be current month
      const now = new Date();
      const expectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      expect(month).toBe(expectedMonth);
    });
  });

  describe('insertRanking', () => {
    test('should insert a ranking record', async () => {
      db = new Database(testDbPath);
      await new Promise(resolve => setTimeout(resolve, 100));

      const ranking = {
        player_name: 'TestPlayer',
        survival_time: 45.123,
        country_code: 'KR',
        month: '2025-11'
      };

      const result = await db.insertRanking(ranking);
      expect(result.id).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
    });

    test('should automatically set month if not provided', async () => {
      db = new Database(testDbPath);
      await new Promise(resolve => setTimeout(resolve, 100));

      const ranking = {
        player_name: 'TestPlayer2',
        survival_time: 30.456,
        country_code: 'US'
      };

      const result = await db.insertRanking(ranking);
      expect(result.id).toBeDefined();

      // Verify month was set automatically
      const now = new Date();
      const expectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const record = await db.getRankingById(result.id);
      expect(record.month).toBe(expectedMonth);
    });
  });

  describe('getRankingsByMonth', () => {
    beforeEach(async () => {
      db = new Database(testDbPath);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Insert test data
      await db.insertRanking({ player_name: 'Player1', survival_time: 50.5, country_code: 'KR', month: '2025-11' });
      await db.insertRanking({ player_name: 'Player2', survival_time: 45.3, country_code: 'US', month: '2025-11' });
      await db.insertRanking({ player_name: 'Player3', survival_time: 60.7, country_code: 'JP', month: '2025-11' });
      await db.insertRanking({ player_name: 'Player4', survival_time: 40.2, country_code: 'KR', month: '2025-10' }); // Different month
    });

    test('should return rankings for specific month sorted by survival_time DESC', async () => {
      const rankings = await db.getRankingsByMonth('2025-11');

      expect(rankings).toHaveLength(3);
      expect(rankings[0].survival_time).toBe(60.7);
      expect(rankings[1].survival_time).toBe(50.5);
      expect(rankings[2].survival_time).toBe(45.3);
    });

    test('should support limit parameter', async () => {
      const rankings = await db.getRankingsByMonth('2025-11', 2);

      expect(rankings).toHaveLength(2);
      expect(rankings[0].survival_time).toBe(60.7);
      expect(rankings[1].survival_time).toBe(50.5);
    });

    test('should return empty array for month with no data', async () => {
      const rankings = await db.getRankingsByMonth('2025-12');

      expect(rankings).toHaveLength(0);
    });
  });

  describe('getBestRecordByMonth', () => {
    beforeEach(async () => {
      db = new Database(testDbPath);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Insert test data
      await db.insertRanking({ player_name: 'Player1', survival_time: 50.5, country_code: 'KR', month: '2025-11' });
      await db.insertRanking({ player_name: 'Player2', survival_time: 45.3, country_code: 'US', month: '2025-11' });
      await db.insertRanking({ player_name: 'Player3', survival_time: 60.7, country_code: 'JP', month: '2025-11' });
    });

    test('should return the best (highest) survival time for the month', async () => {
      const bestRecord = await db.getBestRecordByMonth('2025-11');

      expect(bestRecord).toBeDefined();
      expect(bestRecord.survival_time).toBe(60.7);
      expect(bestRecord.player_name).toBe('Player3');
    });

    test('should return null if no records exist for the month', async () => {
      const bestRecord = await db.getBestRecordByMonth('2025-12');

      expect(bestRecord).toBeNull();
    });
  });
});
