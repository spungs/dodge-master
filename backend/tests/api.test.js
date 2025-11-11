/**
 * API Endpoints Tests
 * Testing REST API endpoints with supertest
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');

// We'll require the app after it's created
let app;
const testDbPath = path.join(__dirname, 'test-api.db');

describe('API Endpoints', () => {
  let serverModule;

  beforeAll(() => {
    // Set test database path as environment variable
    process.env.DATABASE_PATH = testDbPath;
  });

  beforeEach(() => {
    // Clean up test database before each test
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (err) {
        // Ignore if file is locked
      }
    }

    // Require a fresh instance of server
    delete require.cache[require.resolve('../src/server')];
    delete require.cache[require.resolve('../src/database')];
    serverModule = require('../src/server');
    app = serverModule.app;
  });

  afterEach(async () => {
    // Close database connection
    if (serverModule && serverModule.db) {
      await serverModule.db.close();
    }
    // Wait before cleanup
    await new Promise(resolve => setTimeout(resolve, 100));

    // Clean up test database after each test
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (err) {
        // Ignore if file is locked
      }
    }
  });

  describe('POST /api/rankings', () => {
    test('should create a new ranking', async () => {
      const newRanking = {
        player_name: 'TestPlayer',
        survival_time: 45.123,
        country_code: 'KR'
      };

      const response = await request(app)
        .post('/api/rankings')
        .send(newRanking)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(Number)
        }
      });
    });

    test('should validate player_name', async () => {
      const invalidRanking = {
        player_name: '',
        survival_time: 45.123,
        country_code: 'KR'
      };

      const response = await request(app)
        .post('/api/rankings')
        .send(invalidRanking)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String)
      });
    });

    test('should validate survival_time', async () => {
      const invalidRanking = {
        player_name: 'TestPlayer',
        survival_time: -10,
        country_code: 'KR'
      };

      const response = await request(app)
        .post('/api/rankings')
        .send(invalidRanking)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate country_code', async () => {
      const invalidRanking = {
        player_name: 'TestPlayer',
        survival_time: 45.123,
        country_code: 'INVALID'
      };

      const response = await request(app)
        .post('/api/rankings')
        .send(invalidRanking)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/rankings/:month', () => {

    test('should get rankings for a specific month', async () => {
      // Insert test data
      await request(app).post('/api/rankings').send({ player_name: 'Player1', survival_time: 50.5, country_code: 'KR', month: '2025-11' });
      await request(app).post('/api/rankings').send({ player_name: 'Player2', survival_time: 45.3, country_code: 'US', month: '2025-11' });
      await request(app).post('/api/rankings').send({ player_name: 'Player3', survival_time: 60.7, country_code: 'JP', month: '2025-11' });

      const response = await request(app)
        .get('/api/rankings/2025-11')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            player_name: expect.any(String),
            survival_time: expect.any(Number),
            country_code: expect.any(String)
          })
        ])
      });

      expect(response.body.data).toHaveLength(3);
      // Should be sorted by survival_time DESC
      expect(response.body.data[0].survival_time).toBe(60.7);
    });

    test('should support limit query parameter', async () => {
      // Insert test data
      await request(app).post('/api/rankings').send({ player_name: 'Player1', survival_time: 50.5, country_code: 'KR', month: '2025-11' });
      await request(app).post('/api/rankings').send({ player_name: 'Player2', survival_time: 45.3, country_code: 'US', month: '2025-11' });
      await request(app).post('/api/rankings').send({ player_name: 'Player3', survival_time: 60.7, country_code: 'JP', month: '2025-11' });

      const response = await request(app)
        .get('/api/rankings/2025-11?limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    test('should return empty array for month with no data', async () => {
      const response = await request(app)
        .get('/api/rankings/2025-12')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    test('should validate month format', async () => {
      const response = await request(app)
        .get('/api/rankings/invalid-month')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/rankings/best/:month', () => {

    test('should get best record for a specific month', async () => {
      // Insert test data
      await request(app).post('/api/rankings').send({ player_name: 'Player1', survival_time: 50.5, country_code: 'KR', month: '2025-11' });
      await request(app).post('/api/rankings').send({ player_name: 'Player2', survival_time: 45.3, country_code: 'US', month: '2025-11' });
      await request(app).post('/api/rankings').send({ player_name: 'Player3', survival_time: 60.7, country_code: 'JP', month: '2025-11' });

      const response = await request(app)
        .get('/api/rankings/best/2025-11')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          player_name: 'Player3',
          survival_time: 60.7,
          country_code: 'JP'
        }
      });
    });

    test('should return null for month with no data', async () => {
      const response = await request(app)
        .get('/api/rankings/best/2025-12')
        .expect(200);

      expect(response.body.data).toBeNull();
    });

    test('should validate month format', async () => {
      const response = await request(app)
        .get('/api/rankings/best/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String)
      });
    });
  });
});
