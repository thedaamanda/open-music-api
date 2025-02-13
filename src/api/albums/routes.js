const path = require('path');

/**
 * Defines all album-related routes for the API.
 *
 * @param {Object} handler - An instance of AlbumsHandler containing all the route handlers
 * @returns {Array<Object>} Array of route configuration objects
 */
const albumRoutes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums',
    handler: handler.getAlbumsHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postAlbumCoverHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  // {
  //   method: 'GET',
  //   path: 'albums/{param*}',
  //   handler: {
  //     directory: {
  //       path: path.resolve(__dirname, 'fs'),
  //     },
  //   },
  // },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postLikeAlbumHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getLikedAlbumsHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.deleteLikeAlbumHandler,
    options: {
      auth: 'openmusic-app_jwt',
    },
  },
];

module.exports = albumRoutes;
