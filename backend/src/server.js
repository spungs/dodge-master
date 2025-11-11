/**
 * Express API Server
 * RESTful API for Dodge Master rankings
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Database = require('./database');
const {
  validatePlayerName,
  validateSurvivalTime,
  validateCountryCode,
  validateMonth
} = require('./validation');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize Database
const dbPath = process.env.DATABASE_PATH || './rankings.db';
const db = new Database(dbPath);

// Middleware to ensure database is ready
app.use('/api', async (req, res, next) => {
  try {
    await db.ready;
    next();
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Database not ready'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/rankings
 * Create a new ranking record
 */
app.post('/api/rankings', async (req, res) => {
  try {
    const { player_name, survival_time, country_code, month } = req.body;

    // Validate player_name
    const nameValidation = validatePlayerName(player_name);
    if (!nameValidation.valid) {
      return res.status(400).json({
        success: false,
        error: nameValidation.error
      });
    }

    // Validate survival_time
    const timeValidation = validateSurvivalTime(survival_time);
    if (!timeValidation.valid) {
      return res.status(400).json({
        success: false,
        error: timeValidation.error
      });
    }

    // Validate country_code
    const countryValidation = validateCountryCode(country_code);
    if (!countryValidation.valid) {
      return res.status(400).json({
        success: false,
        error: countryValidation.error
      });
    }

    // Validate month if provided
    if (month) {
      const monthValidation = validateMonth(month);
      if (!monthValidation.valid) {
        return res.status(400).json({
          success: false,
          error: monthValidation.error
        });
      }
    }

    // Insert ranking
    const result = await db.insertRanking({
      player_name: nameValidation.value,
      survival_time: timeValidation.value,
      country_code: countryValidation.value,
      month: month // Will use current month if not provided
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error inserting ranking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/rankings/:month
 * Get rankings for a specific month
 */
app.get('/api/rankings/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    // Validate month format
    const monthValidation = validateMonth(month);
    if (!monthValidation.valid) {
      return res.status(400).json({
        success: false,
        error: monthValidation.error
      });
    }

    // Validate limit
    if (limit < 1 || limit > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 1000'
      });
    }

    // Get rankings
    const rankings = await db.getRankingsByMonth(monthValidation.value, limit);

    res.json({
      success: true,
      data: rankings
    });
  } catch (error) {
    console.error('Error getting rankings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/rankings/best/:month
 * Get the best record for a specific month
 */
app.get('/api/rankings/best/:month', async (req, res) => {
  try {
    const { month } = req.params;

    // Validate month format
    const monthValidation = validateMonth(month);
    if (!monthValidation.valid) {
      return res.status(400).json({
        success: false,
        error: monthValidation.error
      });
    }

    // Get best record
    const bestRecord = await db.getBestRecordByMonth(monthValidation.value);

    res.json({
      success: true,
      data: bestRecord
    });
  } catch (error) {
    console.error('Error getting best record:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, db };
