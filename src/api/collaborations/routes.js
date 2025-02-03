/**
 * Defines all the routes for the collaborations endpoint
 *
 * @param {Object} handler - An instance of CollaborationsHandler containing all the route handlers
 * @returns {Array<Object>} Array of route configuration objects
 */
const collaborationsRoutes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
];

module.exports = collaborationsRoutes;
