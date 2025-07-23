import db from "#db/client";

// TRACKS
export async function getAllTracks() {
  const { rows } = await db.query(`SELECT * FROM tracks ORDER BY id`);
  return rows;
}

export async function getTrackById(id) {
  const { rows } = await db.query(`SELECT * FROM tracks WHERE id = $1`, [id]);
  return rows[0] || null;
}

// PLAYLISTS
export async function getAllPlaylists() {
  const { rows } = await db.query(`SELECT * FROM playlists ORDER BY id`);
  return rows;
}

export async function getPlaylistById(id) {
  const { rows } = await db.query(`SELECT * FROM playlists WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createPlaylist({ name, description }) {
  const { rows } = await db.query(
    `INSERT INTO playlists (name, description) VALUES ($1, $2) RETURNING *`,
    [name, description]
  );
  return rows[0];
}

// TRACKS IN A PLAYLIST
export async function getTracksInPlaylist(playlistId) {
  const { rows } = await db.query(
    `SELECT t.*
     FROM playlists_tracks pt
     JOIN tracks t ON pt.track_id = t.id
     WHERE pt.playlist_id = $1
     ORDER BY t.id`,
    [playlistId]
  );
  return rows;
}

export async function addTrackToPlaylist(playlistId, trackId) {
  const { rows } = await db.query(
    `INSERT INTO playlists_tracks (playlist_id, track_id)
     VALUES ($1, $2)
     RETURNING *`,
    [playlistId, trackId]
  );
  return rows[0];
}

export async function trackExists(id) {
  const { rows } = await db.query(`SELECT 1 FROM tracks WHERE id = $1`, [id]);
  return rows.length > 0;
}

export async function playlistExists(id) {
  const { rows } = await db.query(`SELECT 1 FROM playlists WHERE id = $1`, [id]);
  return rows.length > 0;
}

export async function trackInPlaylist(playlistId, trackId) {
  const { rows } = await db.query(
    `SELECT 1 FROM playlists_tracks WHERE playlist_id = $1 AND track_id = $2`,
    [playlistId, trackId]
  );
  return rows.length > 0;
}

export async function removeTrackFromPlaylist(playlistId, trackId) {
  await db.query(
    `DELETE FROM playlists_tracks WHERE playlist_id = $1 AND track_id = $2`,
    [playlistId, trackId]
  );
}
