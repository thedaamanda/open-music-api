const mapDBtoAlbumModel = ({ id, name, year, songs }) => ({
  id,
  name,
  year,
  songs,
});

const mapDBToSongsModel = ({
  id,
  title,
  performer
}) => ({
  id,
  title,
  performer
});

const mapDBToSongModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
});

module.exports = { mapDBtoAlbumModel, mapDBToSongsModel, mapDBToSongModel };
