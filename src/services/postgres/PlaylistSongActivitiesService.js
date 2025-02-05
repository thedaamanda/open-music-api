const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivity({ playlistId, songId, userId }) {
    const id = `ps-activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, 'add', $5) RETURNING id`,
      values: [id, playlistId, songId, userId, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist song activity gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deletePlaylistSongActivity({ playlistId, songId, userId }) {
    const id = `ps-activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, 'delete', $5) RETURNING id`,
      values: [id, playlistId, songId, userId, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist song activity gagal dihapus');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT playlist_song_activities.*, users.username FROM playlist_song_activities
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
