const mapDBtoAlbumModel = ({ id, name, year, songs }) => ({
  id,
  name,
  year,
  songs,
});

module.exports = { mapDBtoAlbumModel };
