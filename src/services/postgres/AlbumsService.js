const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBtoAlbumModel } = require('../../utils');

/**
 * Service class to handle all album-related database operations.
 * Uses PostgreSQL for data persistence and nanoid for unique ID generation.
 */
class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Creates and adds a new album to the database.
   *
   * @param {object} payload - The album data from client request
   * @param {string} payload.name - The name of the album
   * @param {number} payload.year - The release year of the album
   *
   * @throws {InvariantError} When the album cannot be added to the database
   * @returns {Promise<string>} The generated ID of the newly created album
   */
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Retrieves all albums from the database.
   *
   * @returns {Promise<Array<object>>} Array of all albums, mapped to the album model format
   */
  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBtoAlbumModel);
  }

  /**
   * Retrieves a single album by its ID, including all songs in the album.
   *
   * @param {string} id - The unique identifier of the album
   *
   * @throws {NotFoundError} When no album is found with the given ID
   * @returns {Promise<object>} The complete album data including:
   *                           - All album properties mapped to album model format
   *                           - songs: Array of associated songs with their id, title,
   *                             and performer
   */
  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songsQuery = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs WHERE songs.album_id = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);

    return {
      ...result.rows.map(mapDBtoAlbumModel)[0],
      songs: songsResult.rows,
    };
  }

  /**
   * Updates an existing album's information in the database.
   *
   * @param {string} id - The unique identifier of the album to update
   * @param {object} payload - The updated album data
   * @param {string} payload.name - The new name of the album
   * @param {number} payload.year - The new release year
   *
   * @throws {NotFoundError} When no album is found with the given ID
   * @returns {Promise<void>}
   */
  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  /**
   * Removes an album from the database.
   *
   * @param {string} id - The unique identifier of the album to delete
   *
   * @throws {NotFoundError} When no album is found with the given ID
   * @returns {Promise<void>}
   */
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
