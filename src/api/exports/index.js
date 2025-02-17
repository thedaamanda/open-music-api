const ExportsHandler = require('./handler');
const exportsRoutes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { producerService, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler({
      producerService,
      playlistsService,
      validator,
    });
    server.route(exportsRoutes(exportsHandler));
  },
};
