const autoBind = require('auto-bind');

/**
 * Handler class to manage HTTP requests related to collaborations.
 * Uses auto-bind to maintain proper 'this' context in methods.
 */
class CollaborationsHandler {
  /**
   * Initializes a new instance of CollaborationsHandler.
   *
   * @param {Object} dependencies - Dependencies required by the handler
   * @param {Object} dependencies.collaborationsService - The service handling collaboration logic
   * @param {Object} dependencies.playlistsService - The service handling playlist logic
   * @param {Object} dependencies.validator - The validator instance for request payload validation
   */
  constructor({ collaborationsService, playlistsService, validator }) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handles POST request to add a new collaboration.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object
   * @param {Object} request.auth.credentials - Credentials of the authenticated user
   * @param {string} request.auth.credentials.id - ID of the authenticated user
   * @param {Object} request.payload - Request payload containing collaboration data
   * @param {string} request.payload.playlistId - The ID of the playlist to be collaborated on
   * @param {string} request.payload.userId - The ID of the user being added as a collaborator
   * @param {Object} h - The Hapi response toolkit
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {AuthorizationError} When the user is not the playlist owner
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - data: Object containing the new collaborationId
   *                   - HTTP status code 201
   */
  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this._collaborationsService.addCollaboration({
      playlistId,
      userId,
    });

    return h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    }).code(201);
  }

  /**
   * Handles DELETE request to remove a collaboration.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.auth - Authentication object
   * @param {Object} request.auth.credentials - Credentials of the authenticated user
   * @param {string} request.auth.credentials.id - ID of the authenticated user
   * @param {Object} request.payload - Request payload containing collaboration data
   * @param {string} request.payload.playlistId - The ID of the playlist whose collaboration
   *                                              is being removed
   * @param {string} request.payload.userId - The ID of the user being removed from the
   *                                          collaboration
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {AuthorizationError} When the user is not the playlist owner
   * @throws {NotFoundError} When the specified collaboration does not exist
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration({ playlistId, userId });

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
