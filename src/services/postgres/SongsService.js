const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToSongModel, mapDBToSongsModel } = require('../../utils');

/**
 * Service class to handle all song-related database operations.
 * Uses PostgreSQL for data persistence and nanoid for unique ID generation.
 */
class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Creates and adds a new song to the database.
   *
   * @param {object} payload - The song data from client request
   * @param {string} payload.title - The title of the song
   * @param {number} payload.year - The release year of the song
   * @param {string} payload.genre - The genre of the song
   * @param {string} payload.performer - The performer/artist of the song
   * @param {number} [payload.duration] - The duration of the song in seconds (optional)
   * @param {string} [payload.albumId] - The ID of the album this song belongs to (optional)
   *
   * @throws {InvariantError} When the song cannot be added to the database
   * @returns {Promise<string>} The generated ID of the newly created song
   */
  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Retrieves songs from the database with optional filtering.
   *
   * @param {object} filters - The filter criteria
   * @param {string} [filters.title] - Filter songs by title (case-insensitive partial match)
   * @param {string} [filters.performer] - Filter songs by performer (case-insensitive partial
   *                                       match)
   *
   * @returns {Promise<Array<object>>} Array of songs matching the filter criteria,
   *                                   each containing id, title, and performer
   */
  async getSongs({ title, performer }) {
    let query = 'SELECT id, title, performer FROM songs';
    const values = [];

    const conditions = [];

    if (title) {
      values.push(`%${title}%`);
      conditions.push(`LOWER(title) LIKE LOWER($${values.length})`);
    }

    if (performer) {
      values.push(`%${performer}%`);
      conditions.push(`LOWER(performer) LIKE LOWER($${values.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query(query, values);
    return result.rows.map(mapDBToSongsModel);
  }

  /**
   * Retrieves all songs that belong to a specific album.
   *
   * @param {string} albumId - The unique identifier of the album
   *
   * @returns {Promise<Array<object>>} Array of songs that belong to the album
   *                                  each containing id, title, and performer
   *
   * @throws {NotFoundError} When no album is found with the given ID
   * @returns {Promise<Array<object>>} Array of songs that belong to the album
   *                                 each containing id, title, and performer
   */
  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToSongModel);
  }

  /**
   * Retrieves a single song by its ID.
   *
   * @param {string} id - The unique identifier of the song
   *
   * @throws {NotFoundError} When no song is found with the given ID
   * @returns {Promise<object>} The complete song data
   */
  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBToSongModel)[0];
  }

  /**
   * Updates an existing song's information in the database.
   *
   * @param {string} id - The unique identifier of the song to update
   * @param {object} payload - The updated song data
   * @param {string} payload.title - The new title of the song
   * @param {number} payload.year - The new release year
   * @param {string} payload.performer - The new performer/artist
   * @param {string} payload.genre - The new genre
   * @param {number} [payload.duration] - The new duration in seconds
   * @param {string} [payload.albumId] - The new album ID
   *
   * @throws {NotFoundError} When no song is found with the given ID
   * @returns {Promise<void>}
   */
  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  /**
   * Removes a song from the database.
   *
   * @param {string} id - The unique identifier of the song to delete
   *
   * @throws {NotFoundError} When no song is found with the given ID
   * @returns {Promise<void>}
   */
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal dihapus. Id tidak ditemukan');
    }
  }

  /**
   * Verifies whether a song exists in the database.
   *
   * @param {string} id - The unique identifier of the song
   *
   * @returns {Promise<boolean>} True if the song exists, otherwise false
   */
  async verifySongExists(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }
}

module.exports = SongsService;
