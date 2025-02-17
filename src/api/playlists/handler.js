const autoBind = require('auto-bind');

/**
 * Handler class to manage HTTP requests related to playlists.
 * Uses auto-bind to maintain proper 'this' context in methods.
 */
class PlaylistsHandler {
  /**
   * Initializes a new instance of PlaylistsHandler.
   *
   * @param {Object} dependencies - The dependencies for the handler
   * @param {Object} dependencies.playlistsService - The service for handling playlist
   *                                                 business logic
   * @param {Object} dependencies.playlistSongsService - The service for handling playlist songs
   * @param {Object} dependencies.playlistSongActivitiesService - The service for managing
   *                                                              playlist activities
   * @param {Object} dependencies.validator - The validator instance for request payload validation
   */
  constructor({
    playlistsService,
    playlistSongsService,
    playlistSongActivitiesService,
    cacheService,
    validator,
  }) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._cacheService = cacheService;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handles POST request to create a new playlist.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object containing credentials
   * @param {Object} request.payload - Request payload containing playlist data
   * @param {string} request.payload.name - The name of the playlist
   * @param {Object} h - The Hapi response toolkit
   *
   * @throws {ValidationError} When the request payload fails validation
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - data: Object containing the new playlistId
   *                   - HTTP status code 201
   */
  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { name } = request.payload;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  /**
   * Handles GET request to retrieve all playlists owned by the authenticated user.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object containing credentials
   *
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - data: Object containing an array of playlists
   */
  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    try {
      const playlists = JSON.parse(await this._cacheService.get(`playlists:${credentialId}`));
      const playlists1 = await this._playlistsService.getPlaylists(credentialId);
      console.log(playlists);
      console.log(playlists1);
      const response = h.response({
        status: 'success',
        data: {
          playlists,
        },
      });
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      const playlists = await this._playlistsService.getPlaylists(credentialId);
      await this._cacheService.set(`playlists:${credentialId}`, JSON.stringify(playlists), 60 * 30);

      return {
        status: 'success',
        data: {
          playlists,
        },
      };
    }
  }

  /**
   * Handles DELETE request to remove a playlist.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object containing credentials
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.playlistId - The ID of the playlist to delete
   *
   * @throws {NotFoundError} When the specified playlist is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async deletePlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylistById(playlistId);

    await this._cacheService.delete(`playlists:${credentialId}`);
    await this._cacheService.delete(`activities:${playlistId}`);
    await this._cacheService.delete(`songs:${playlistId}`);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  /**
   * Handles POST request to add a song to a playlist.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object containing credentials
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.playlistId - The ID of the playlist
   * @param {Object} request.payload - Request payload containing song data
   * @param {string} request.payload.songId - The ID of the song to add
   * @param {Object} h - The Hapi response toolkit
   *
   * @throws {ValidationError} When the request payload fails validation
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - HTTP status code 201
   */
  async postSongToPlaylist(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.addSongToPlaylist(playlistId, songId);
    await this._playlistSongActivitiesService.addPlaylistSongActivity({
      playlistId,
      songId,
      userId: credentialId,
    });

    await this._cacheService.delete(`activities:${playlistId}`);
    await this._cacheService.delete(`songs:${playlistId}`);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  /**
   * Handles GET request to retrieve all songs from a playlist.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object containing credentials
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.playlistId - The ID of the playlist
   *
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - data: Object containing the playlist and its songs
   */
  async getSongsFromPlaylist(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistsService.getPlaylistById(playlistId);

    try {
      playlist.songs = JSON.parse(await this._cacheService.get(`songs:${playlistId}`));

      const response = h.response({
        status: 'success',
        data: {
          playlist,
        },
      });
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      playlist.songs = await this._playlistSongsService.getSongsFromPlaylist(
        playlistId,
      );

      await this._cacheService.set(`songs:${playlistId}`, JSON.stringify(playlist.songs), 60 * 30);

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    }
  }

  /**
   * Handles DELETE request to remove a song from a playlist.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object containing credentials
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.playlistId - The ID of the playlist
   * @param {Object} request.payload - Request payload containing song data
   * @param {string} request.payload.songId - The ID of the song to remove
   *
   * @throws {ValidationError} When the request payload fails validation
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async deleteSongFromPlaylist(request) {
    this._validator.validatePlaylistSongActivityPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId);
    await this._playlistSongActivitiesService.deletePlaylistSongActivity({
      playlistId,
      songId,
      userId: credentialId,
    });

    await this._cacheService.delete(`activities:${playlistId}`);
    await this._cacheService.delete(`songs:${playlistId}`);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  /**
   * Handles GET request to retrieve playlist song activities.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object containing credentials
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.playlistId - The ID of the playlist
   *
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - data: Object containing playlist ID and activities
   */
  async getPlaylistSongActivitiesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    try {
      const activities = JSON.parse(await this._cacheService.get(`activities:${playlistId}`));

      const response = h.response({
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      });
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

      const activities = await this._playlistSongActivitiesService.getPlaylistSongActivities(
        playlistId,
      );

      await this._cacheService.set(`activities:${playlistId}`, JSON.stringify(activities), 60 * 30);

      return {
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      };
    }
  }
}

module.exports = PlaylistsHandler;
