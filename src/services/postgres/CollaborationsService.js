const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

/**
 * Service class to handle all playlist collaboration-related database operations.
 * Uses PostgreSQL for data persistence, nanoid for unique ID generation,
 * and integrates with UserService for user verification.
 */
class CollaborationsService {
  /**
   * Creates a new instance of CollaborationsService.
   *
   * @param {object} userService - Instance of UserService for user verification
   */
  constructor(userService) {
    this._pool = new Pool();
    this._userService = userService;
  }

  /**
   * Adds a new collaboration record between a user and a playlist.
   * Verifies that the user exists before creating the collaboration.
   *
   * @param {object} payload - The collaboration data
   * @param {string} payload.playlistId - The ID of the playlist to collaborate on
   * @param {string} payload.userId - The ID of the user to add as collaborator
   *
   * @throws {InvariantError} When the collaboration cannot be added to the database
   * @throws {NotFoundError} When the specified user does not exist (from UserService)
   * @returns {Promise<string>} The generated ID of the newly created collaboration
   */
  async addCollaboration({ playlistId, userId }) {
    await this._userService.getUserById(userId);

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Removes a collaboration record between a user and a playlist.
   *
   * @param {object} payload - The collaboration data to delete
   * @param {string} payload.playlistId - The ID of the playlist
   * @param {string} payload.userId - The ID of the user to remove as collaborator
   *
   * @throws {InvariantError} When the collaboration cannot be deleted or doesn't exist
   * @returns {Promise<void>}
   */
  async deleteCollaboration({ playlistId, userId }) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  /**
   * Verifies if a user has collaboration access to a specific playlist.
   *
   * @param {object} payload - The collaboration data to verify
   * @param {string} payload.playlistId - The ID of the playlist
   * @param {string} payload.userId - The ID of the user to verify
   *
   * @throws {AuthorizationError} When the user does not have collaboration access
   * @returns {Promise<void>}
   */
  async verifyCollaborator({ playlistId, userId }) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('Akses ditolak');
    }
  }
}

module.exports = CollaborationsService;
