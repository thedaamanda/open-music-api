const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

/**
 * Service class to handle authentication-related database operations.
 * Uses PostgreSQL for data persistence.
 */
class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Stores a refresh token in the database.
   *
   * @param {string} token - The refresh token to be stored
   * @returns {Promise<void>}
   */
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  /**
   * Verifies if a refresh token exists in the database.
   *
   * @param {string} token - The refresh token to be verified
   * @throws {InvariantError} When the refresh token is not found in the database
   * @returns {Promise<void>}
   */
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  /**
   * Deletes a refresh token from the database.
   *
   * @param {string} token - The refresh token to be removed
   * @returns {Promise<void>}
   */
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await this._pool.query(query);
  }
}

module.exports = AuthenticationsService;
