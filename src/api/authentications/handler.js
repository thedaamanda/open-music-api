const autoBind = require('auto-bind');

/**
 * Handler class to manage HTTP requests related to user authentication.
 * Uses auto-bind to maintain proper 'this' context in methods.
 */
class AuthenticationsHandler {
  /**
   * Initializes a new instance of AuthenticationsHandler.
   *
   * @param {Object} authenticationsService - The authentication service instance for handling
   *                                          business logic
   * @param {Object} usersService - The user service instance for handling user-related operations
   * @param {Object} tokenManager - The token manager instance for generating and verifying tokens
   * @param {Object} validator - The validator instance for request payload validation
   */
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handles POST request to authenticate a user and generate access and refresh tokens.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.payload - Request payload containing user credentials
   * @param {string} request.payload.username - The username of the user
   * @param {string} request.payload.password - The password of the user
   * @param {Object} h - The Hapi response toolkit
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {AuthenticationError} When the user credentials are invalid
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - data: Object containing the accessToken and refreshToken
   *                   - HTTP status code 201
   */
  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsService.addRefreshToken(refreshToken);

    return h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    }).code(201);
  }

  /**
   * Handles PUT request to refresh an access token using a valid refresh token.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.payload - Request payload containing the refresh token
   * @param {string} request.payload.refreshToken - The refresh token used to generate
   *                                                a new access token
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {AuthenticationError} When the refresh token is invalid
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - data: Object containing the new accessToken
   */
  async putAuthenticationHandler(request) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  /**
   * Handles DELETE request to invalidate a refresh token.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.payload - Request payload containing the refresh token to delete
   * @param {string} request.payload.refreshToken - The refresh token to invalidate
   *
   * @throws {ValidationError} When the request payload fails validation
   * @throws {AuthenticationError} When the refresh token is invalid
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   */
  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
