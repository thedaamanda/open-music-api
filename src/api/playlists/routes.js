/**
 * Defines all routes for the playlists API
 *
 * @param {Object} handler - An instance of PlaylistsHandler containing all the route handlers
 * @returns {Array<Object>} Array of route configuration objects
 */
const playlistsRoutes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}',
    handler: handler.deletePlaylistHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.postSongToPlaylist,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getSongsFromPlaylist,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: handler.deleteSongFromPlaylist,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/activities',
    handler: handler.getPlaylistSongActivitiesHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  }
];

module.exports = playlistsRoutes;
