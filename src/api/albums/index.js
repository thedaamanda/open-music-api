const AlbumsHandler = require('./handler');
const albumRoutes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { albumsService, storageService, albumLikesService, validator }) => {
    const albumsHandler = new AlbumsHandler({
      albumsService,
      storageService,
      albumLikesService,
      validator,
    });
    server.route(albumRoutes(albumsHandler));
  },
};
