/**
 * Defines all authentication-related routes for the API.
 *
 * @param {Object} handler - An instance of AuthenticationsHandler containing all the route handlers
 * @returns {Array<Object>} Array of route configuration objects
 */
const authenticationRoutes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
  },
];

module.exports = authenticationRoutes;
