const AlbumsHandler = require('./handler');
const albumRoutes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { albumsService, storageService, albumLikesService, cacheService, validator }) => {
    const albumsHandler = new AlbumsHandler({
      albumsService,
      storageService,
      albumLikesService,
      cacheService,
      validator,
    });
    server.route(albumRoutes(albumsHandler));
  },
};
