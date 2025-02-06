const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');

/**
 * Service class to handle all playlist song activity tracking operations.
 * Tracks when songs are added to or removed from playlists, including
 * who performed the action and when it occurred.
 * Uses PostgreSQL for data persistence and nanoid for unique ID generation.
 */
class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Records an activity when a song is added to a playlist.
   *
   * @param {object} payload - The activity data
   * @param {string} payload.playlistId - The ID of the playlist
   * @param {string} payload.songId - The ID of the song being added
   * @param {string} payload.userId - The ID of the user performing the action
   *
   * @throws {InvariantError} When the activity cannot be recorded in the database
   * @returns {Promise<string>} The generated ID of the newly created activity record
   */
  async addPlaylistSongActivity({ playlistId, songId, userId }) {
    const id = `ps-activities-${nanoid(16)}`;
    const action = 'add';
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist song activity gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Records an activity when a song is removed from a playlist.
   *
   * @param {object} payload - The activity data
   * @param {string} payload.playlistId - The ID of the playlist
   * @param {string} payload.songId - The ID of the song being removed
   * @param {string} payload.userId - The ID of the user performing the action
   *
   * @throws {InvariantError} When the activity cannot be recorded in the database
   * @returns {Promise<string>} The generated ID of the newly created activity record
   */
  async deletePlaylistSongActivity({ playlistId, songId, userId }) {
    const id = `ps-activities-${nanoid(16)}`;
    const action = 'delete';
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist song activity gagal dihapus');
    }

    return result.rows[0].id;
  }

  /**
   * Retrieves all activities for a specific playlist.
   * Includes detailed information about the user who performed the action
   * and the song that was affected.
   *
   * @param {string} playlistId - The ID of the playlist to get activities for
   *
   * @returns {Promise<Array<object>>} Array of activity records, each containing:
   *                                   - username: The name of the user who performed the action
   *                                   - title: The title of the song affected
   *                                   - action: The type of action performed ('add' or 'delete')
   *                                   - time: When the action occurred
   */
  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
