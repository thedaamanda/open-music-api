const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

/**
 * Service class to handle all playlist-related database operations.
 * Uses PostgreSQL for data persistence and nanoid for unique ID generation.
 */
class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  /**
   * Creates and adds a new playlist to the database.
   *
   * @param {object} payload - The playlist data from client request
   * @param {string} payload.name - The name of the playlist
   * @param {string} payload.owner - The owner ID of the playlist
   *
   * @throws {InvariantError} When the playlist cannot be added to the database
   * @returns {Promise<string>} The generated ID of the newly created playlist
   */
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this._collaborationsService.addCollaboration({ playlistId: id, userId: owner });

    return result.rows[0].id;
  }

  /**
   * Retrieves playlists owned by or shared with a specific user.
   *
   * @param {string} owner - The ID of the user
   *
   * @returns {Promise<Array<object>>} Array of playlists containing id, name, and owner's username
   */
  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  /**
   * Retrieves a single playlist by its ID.
   *
   * @param {string} id - The unique identifier of the playlist
   *
   * @throws {NotFoundError} When no playlist is found with the given ID
   * @returns {Promise<object>} The complete playlist data, including the owner's username
   */
  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.*, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  /**
   * Removes a playlist from the database.
   *
   * @param {string} id - The unique identifier of the playlist to delete
   *
   * @throws {NotFoundError} When no playlist is found with the given ID
   * @returns {Promise<void>}
   */
  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  /**
   * Verifies whether a user is the owner of a playlist.
   *
   * @param {string} id - The unique identifier of the playlist
   * @param {string} owner - The user ID to verify ownership
   *
   * @throws {NotFoundError} When no playlist is found with the given ID
   * @throws {AuthorizationError} When the user is not the owner
   */
  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /**
   * Verifies whether a user has access to a playlist (either as owner or collaborator).
   *
   * @param {string} id - The unique identifier of the playlist
   * @param {string} userId - The user ID to verify access
   *
   * @throws {NotFoundError} When no playlist is found with the given ID
   * @throws {AuthorizationError} When the user has no access to the playlist
   */
  async verifyPlaylistAccess(id, userId) {
    try {
      await this.verifyPlaylistOwner(id, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
    }

    await this._collaborationsService.verifyCollaborator({ playlistId: id, userId });
  }
}

module.exports = PlaylistsService;
