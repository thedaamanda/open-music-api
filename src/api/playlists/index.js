const PlaylistsHandler = require('./handler');
const playlistsRoutes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    playlistSongsService,
    playlistSongActivitiesService,
    cacheService,
    validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler({
      playlistsService,
      playlistSongsService,
      playlistSongActivitiesService,
      cacheService,
      validator,
    });
    server.route(playlistsRoutes(playlistsHandler));
  },
};
