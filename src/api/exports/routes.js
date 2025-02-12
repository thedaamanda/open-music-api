/**
 * Defines all export-related routes for the API.
 *
 * @param {Object} handler - An instance of ExportsHandler containing all the route handlers
 * @returns {Array<Object>} Array of route configuration objects
 */
const exportsRoutes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportPlaylistHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
];

module.exports = exportsRoutes;
