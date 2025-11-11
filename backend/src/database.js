/**
 * Database Module
 * Handles SQLite database operations for rankings
 */

const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

class RankingsDatabase {
  constructor(dbPath = './rankings.db') {
    this.db = new sqlite3.Database(dbPath);

    // Promisify common methods
    this.dbGet = promisify(this.db.get.bind(this.db));
    this.dbAll = promisify(this.db.all.bind(this.db));

    // Custom promisify for run to capture lastID
    this.dbRun = (sql, ...params) => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    };

    this.ready = this.initializeDatabase();
  }

  /**
   * Initialize database schema
   * Creates tables and indexes if they don't exist
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS rankings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        survival_time REAL NOT NULL,
        country_code TEXT NOT NULL,
        month TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createMonthIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_month ON rankings(month)
    `;

    const createTimeIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_survival_time ON rankings(survival_time DESC)
    `;

    await this.dbRun(createTableSQL);
    await this.dbRun(createMonthIndexSQL);
    await this.dbRun(createTimeIndexSQL);
  }

  /**
   * Get table information for testing
   * @param {string} tableName
   * @returns {Promise<Array>} Table schema information
   */
  async getTableInfo(tableName) {
    return this.dbAll(`PRAGMA table_info(${tableName})`);
  }

  /**
   * Get indexes for a table
   * @param {string} tableName
   * @returns {Promise<Array>} Index information
   */
  async getIndexes(tableName) {
    return this.dbAll(`PRAGMA index_list(${tableName})`);
  }

  /**
   * Get current month in YYYY-MM format
   * @returns {string} Current month
   */
  getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Insert a new ranking record
   * @param {Object} ranking - Ranking data
   * @param {string} ranking.player_name - Player name
   * @param {number} ranking.survival_time - Survival time in seconds
   * @param {string} ranking.country_code - 2-letter country code
   * @param {string} [ranking.month] - Month in YYYY-MM format (defaults to current month)
   * @returns {Promise<{id: number}>} Inserted record ID
   */
  async insertRanking(ranking) {
    const month = ranking.month || this.getCurrentMonth();

    const sql = `
      INSERT INTO rankings (player_name, survival_time, country_code, month)
      VALUES (?, ?, ?, ?)
    `;

    const result = await this.dbRun(
      sql,
      ranking.player_name,
      ranking.survival_time,
      ranking.country_code,
      month
    );

    return { id: result.lastID };
  }

  /**
   * Get a ranking by ID
   * @param {number} id - Ranking ID
   * @returns {Promise<Object|null>} Ranking record or null
   */
  async getRankingById(id) {
    const sql = `SELECT * FROM rankings WHERE id = ?`;
    const result = await this.dbGet(sql, id);
    return result || null;
  }

  /**
   * Get rankings for a specific month
   * @param {string} month - Month in YYYY-MM format
   * @param {number} [limit=100] - Maximum number of records to return
   * @returns {Promise<Array>} Array of ranking records sorted by survival_time DESC
   */
  async getRankingsByMonth(month, limit = 100) {
    const sql = `
      SELECT * FROM rankings
      WHERE month = ?
      ORDER BY survival_time DESC
      LIMIT ?
    `;

    const results = await this.dbAll(sql, month, limit);
    return results;
  }

  /**
   * Get the best (highest) record for a specific month
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise<Object|null>} Best ranking record or null
   */
  async getBestRecordByMonth(month) {
    const sql = `
      SELECT * FROM rankings
      WHERE month = ?
      ORDER BY survival_time DESC
      LIMIT 1
    `;

    const result = await this.dbGet(sql, month);
    return result || null;
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  close() {
    if (!this.db || !this.db.open) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err && err.code !== 'SQLITE_MISUSE') {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = RankingsDatabase;
