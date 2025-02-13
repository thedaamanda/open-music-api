const autoBind = require('auto-bind');

/**
 * Handler class to manage HTTP requests related to albums.
 * Uses auto-bind to maintain proper 'this' context in methods.
 */
class AlbumsHandler {
  /**
   * Initializes a new instance of AlbumsHandler.
   *
   * @param {Object} service - The album service instance for handling business logic
   * @param {Object} validator - The validator instance for request payload validation
   */
  constructor({ albumsService, storageService, albumLikesService, validator }) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._albumLikesService = albumLikesService;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handles POST request to create a new album.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.payload - Request payload containing album data
   * @param {string} request.payload.name - The name of the album
   * @param {number} request.payload.year - The release year of the album
   * @param {Object} h - The Hapi response toolkit
   *
   * @throws {ValidationError} When the request payload fails validation
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - data: Object containing the new albumId
   *                   - HTTP status code 201
   */
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  /**
   * Handles GET request to retrieve all albums.
   *
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - data: Object containing array of albums
   */
  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  /**
   * Handles GET request to retrieve a specific album by ID.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the album to retrieve
   *
   * @throws {NotFoundError} When the specified album is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - data: Object containing the requested album
   */
  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  /**
   * Handles PUT request to update an existing album.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the album to update
   * @param {Object} request.payload - The updated album data
   * @param {string} request.payload.name - The new name of the album
   * @param {number} request.payload.year - The new release year
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {NotFoundError} When the specified album is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  /**
   * Handles DELETE request to remove an album.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the album to delete
   *
   * @throws {NotFoundError} When the specified album is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  /**
   * Handles POST request to upload an album's cover image.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the album to upload the cover image for
   * @param {Object} request.payload - The multipart form data payload
   * @param {Object} request.payload.file - The file to upload
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {NotFoundError} When the specified album is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const fileLocation = await this._storageService.writeFile(cover, cover.hapi);

    await this._albumsService.addCoverUrlOnAlbumById(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  /**
   * Handles POST request to like an album.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth.credentials - Authenticated user's credentials
   * @param {string} request.auth.credentials.id - The ID of the authenticated user
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the album to like
   *
   * @throws {NotFoundError} When the specified album is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async postLikeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(id);
    await this._albumLikesService.addLikeAlbum(userId, id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dilike',
    });
    response.code(201);
    return response;
  }

  /**
   * Handles GET request to retrieve the number of likes for an album.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the album to retrieve the number of likes for
   *
   * @returns {Object} Response object with:
   *                  - status: 'success'
   *                  - data: Object containing the number of likes for the album
   */
  async getLikedAlbumsHandler(request) {
    const { id } = request.params;
    const likes = await this._albumLikesService.albumLikesCount(id);

    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }

  /**
   * Handles DELETE request to unlike an album.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth.credentials - Authenticated user's credentials
   * @param {string} request.auth.credentials.id - The ID of the authenticated user
   * @param {Object} request.params - Request parameters
   * @param {string} request.params.id - The ID of the album to unlike
   *
   * @throws {NotFoundError} When the specified album is not found
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async deleteLikeAlbumHandler(request) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumLikesService.deleteLikeAlbum(userId, id);

    return {
      status: 'success',
      message: 'Album berhasil diunlike',
    };
  }
}

module.exports = AlbumsHandler;
