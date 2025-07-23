import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  await db.query("DELETE FROM playlists_tracks");
  await db.query("DELETE FROM playlists");
  await db.query("DELETE FROM tracks");

  const trackData = Array.from({ length: 20 }, (_, i) => ({
    name: `Track ${i + 1}`,
    duration_ms: 180000 + i * 1000, // 3 min + i sec
  }));

  const playlistData = Array.from({ length: 10 }, (_, i) => ({
    name: `Playlist ${i + 1}`,
    description: `Description for Playlist ${i + 1}`,
  }));

  const insertedTracks = await Promise.all(
    trackData.map(({ name, duration_ms }) =>
      db
        .query(
          `INSERT INTO tracks (name, duration_ms) VALUES ($1, $2) RETURNING *`,
          [name, duration_ms]
        )
        .then((res) => res.rows[0])
    )
  );

  const insertedPlaylists = await Promise.all(
    playlistData.map(({ name, description }) =>
      db
        .query(
          `INSERT INTO playlists (name, description) VALUES ($1, $2) RETURNING *`,
          [name, description]
        )
        .then((res) => res.rows[0])
    )
  );

  // Add 15+ playlist_track connections
  let count = 0;
  for (const playlist of insertedPlaylists) {
    const randomTracks = insertedTracks
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, 2); // Add 2 tracks per playlist

    for (const track of randomTracks) {
      await db.query(
        `INSERT INTO playlists_tracks (playlist_id, track_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [playlist.id, track.id]
      );
      count++;
    }
  }

  console.log(`Seeded ${insertedTracks.length} tracks, ${insertedPlaylists.length} playlists, ${count} associations.`);
}
