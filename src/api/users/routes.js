/**
 * Defines all user-related routes for the API.
 *
 * @param {Object} handler - An instance of UsersHandler containing all the route handlers
 * @returns {Array<Object>} Array of route configuration objects
 */
const userRoutes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
];

module.exports = userRoutes;
