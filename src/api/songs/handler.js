const autoBind = require('auto-bind');

/**
 * Handler class to manage HTTP requests related to songs.
 * Uses auto-bind to maintain proper 'this' context in methods.
 */
class SongsHandler {
  /**
   * Initializes a new instance of SongsHandler.
   *
   * @param {Object} service - The song service instance for handling business logic
   * @param {Object} validator - The validator instance for request payload validation
   */
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handles POST request to create a new song.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.payload - Request payload containing song data
   * @param {string} request.payload.title - The title of the song
   * @param {number} request.payload.year - The release year of the song
   * @param {string} request.payload.genre - The genre of the song
   * @param {string} request.payload.performer - The performer of the song
   * @param {number} [request.payload.duration] - The duration of the song in seconds (optional)
   * @param {string} [request.payload.albumId] - The ID of the album this song belongs to (optional)
   * @param {Object} h - The Hapi response toolkit
   *
   * @throws {ValidationError} When the request payload fails validation
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - data: Object containing the new songId
   *                   - HTTP status code 201
   */
  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;

    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  /**
   * Handles GET request to retrieve songs with optional filtering.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.query - Query parameters
   * @param {string} [request.query.title] - Optional title filter
   * @param {string} [request.query.performer] - Optional performer filter
   *
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - data: Object containing filtered array of songs
   */
  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs({ title, performer });
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  /**
   * Handles GET request to retrieve a specific song by ID.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the song to retrieve
   *
   * @throws {NotFoundError} When the specified song is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - data: Object containing the requested song
   */
  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  /**
   * Handles PUT request to update an existing song.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the song to update
   * @param {Object} request.payload - The updated song data
   * @param {string} request.payload.title - The new title of the song
   * @param {number} request.payload.year - The new release year
   * @param {string} request.payload.genre - The new genre
   * @param {string} request.payload.performer - The new performer
   * @param {number} [request.payload.duration] - The new duration in seconds (optional)
   * @param {string} [request.payload.albumId] - The new album ID (optional)
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {NotFoundError} When the specified song is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  /**
   * Handles DELETE request to remove a song.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the song to delete
   *
   * @throws {NotFoundError} When the specified song is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
