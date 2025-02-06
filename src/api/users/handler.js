const autoBind = require('auto-bind');

/**
 * Handler class to manage HTTP requests related to users.
 * Uses auto-bind to maintain proper 'this' context in methods.
 */
class UsersHandler {
  /**
   * Initializes a new instance of UsersHandler.
   *
   * @param {Object} service - The user service instance for handling business logic
   * @param {Object} validator - The validator instance for request payload validation
   */
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handles POST request to create a new user.
   *
   * @param {Object} request - The Hapi request object
   * @param {Object} request.payload - Request payload containing user data
   * @param {string} request.payload.username - The username of the user
   * @param {string} request.payload.password - The password of the user
   * @param {string} request.payload.fullname - The full name of the user
   * @param {Object} h - The Hapi response toolkit
   *
   * @throws {ValidationError} When the request payload fails validation
   * @returns {Object} Response object with:
   *                   - status: 'success'
   *                   - message: Success message
   *                   - data: Object containing the new userId
   *                   - HTTP status code 201
   */
  async postUserHandler(request, h) {
    this._validator.validateUsersPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this._service.addUser({ username, password, fullname });

    return h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    }).code(201);
  }
}

module.exports = UsersHandler;
