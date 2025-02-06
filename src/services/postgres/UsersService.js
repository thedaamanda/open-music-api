const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

/**
 * Service class to handle all user-related database operations.
 * Uses PostgreSQL for data persistence, bcrypt for password hashing,
 * and nanoid for unique ID generation.
 */
class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Creates and adds a new user to the database.
   *
   * @param {object} payload - The user data from client request
   * @param {string} payload.username - The unique username for the user
   * @param {string} payload.password - The user's password (will be hashed)
   * @param {string} payload.fullname - The user's full name
   *
   * @throws {InvariantError} When the user cannot be added to the database
   * @throws {InvariantError} When the username is already taken
   * @returns {Promise<string>} The generated ID of the newly created user
   */
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  /**
   * Verifies that a username is not already taken in the database.
   *
   * @param {string} username - The username to verify
   *
   * @throws {InvariantError} When the username is already in use
   * @returns {Promise<void>}
   */
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  /**
   * Retrieves a user's information by their ID.
   *
   * @param {string} id - The unique identifier of the user
   *
   * @throws {NotFoundError} When no user is found with the given ID
   * @returns {Promise<object>} The user data (id, username, fullname)
   */
  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  /**
   * Verifies user credentials for authentication.
   *
   * @param {string} username - The username to verify
   * @param {string} password - The password to verify
   *
   * @throws {AuthenticationError} When the credentials are invalid
   * @returns {Promise<string>} The ID of the authenticated user
   */
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, username, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = UsersService;
