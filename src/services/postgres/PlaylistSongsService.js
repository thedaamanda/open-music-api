const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

/**
 * Service class to handle all playlist song-related database operations.
 * Uses PostgreSQL for data persistence and nanoid for unique ID generation.
 */
class PlaylistSongsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  /**
   * Adds a song to a playlist.
   *
   * @param {string} playlistId - The unique identifier of the playlist
   * @param {string} songId - The unique identifier of the song
   *
   * @throws {InvariantError} When the song cannot be added to the playlist
   * @throws {NotFoundError} When the song does not exist
   * @returns {Promise<string>} The generated ID of the newly added playlist song entry
   */
  async addSongToPlaylist(playlistId, songId) {
    await this._songsService.verifySongExists(songId);

    const id = `playlist-songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  /**
   * Retrieves songs from a specific playlist.
   *
   * @param {string} playlistId - The unique identifier of the playlist
   *
   * @returns {Promise<Array<object>>} Array of songs in the playlist,
   *                                   each containing id, title, and performer
   */
  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
      JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  /**
   * Removes a song from a playlist.
   *
   * @param {string} playlistId - The unique identifier of the playlist
   * @param {string} songId - The unique identifier of the song
   *
   * @throws {NotFoundError} When the song does not exist in the playlist
   * @returns {Promise<void>}
   */
  async deleteSongFromPlaylist(playlistId, songId) {
    await this._songsService.verifySongExists(songId);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
