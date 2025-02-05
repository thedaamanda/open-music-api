const PlaylistsHandler = require('./handler');
const playlistsRoutes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { playlistsService, playlistSongsService, playlistSongActivitiesService, validator }) => {
    const playlistsHandler = new PlaylistsHandler({ playlistsService, playlistSongsService, playlistSongActivitiesService, validator });
    server.route(playlistsRoutes(playlistsHandler));
  },
};
