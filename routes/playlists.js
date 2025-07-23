import express from "express";
import {
  getAllPlaylists,
  createPlaylist,
  getPlaylistById,
  getTracksInPlaylist,
  addTrackToPlaylist,
  trackExists,
  playlistExists,
  trackInPlaylist,
} from "#db/queries";

const router = express.Router();
router.use(express.json());

// GET /playlists
router.get("/", async (req, res, next) => {
  try {
    const playlists = await getAllPlaylists();
    res.json(playlists);
  } catch (err) {
    next(err);
  }
});

// POST /playlists
router.post("/", async (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.sendStatus(400);
  }

  const { name, description } = req.body;
  if (!name || !description) return res.sendStatus(400);

  try {
    const playlist = await createPlaylist({ name, description });
    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
});

// GET /playlists/:id
router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.sendStatus(400);

  try {
    const playlist = await getPlaylistById(id);
    if (!playlist) return res.sendStatus(404);
    res.json(playlist);
  } catch (err) {
    next(err);
  }
});

// GET /playlists/:id/tracks
router.get("/:id/tracks", async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.sendStatus(400);

  try {
    const exists = await playlistExists(id);
    if (!exists) return res.sendStatus(404);

    const tracks = await getTracksInPlaylist(id);
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

// POST /playlists/:id/tracks
router.post("/:id/tracks", async (req, res, next) => {
  const playlistId = Number(req.params.id);

  if (!req.body || typeof req.body !== "object") {
    return res.sendStatus(400);
  }

  const { trackId } = req.body;

  if (isNaN(playlistId) || isNaN(trackId)) return res.sendStatus(400);
  if (!trackId) return res.sendStatus(400);

  try {
    const playlistOk = await playlistExists(playlistId);
    if (!playlistOk) return res.sendStatus(404);

    const trackOk = await trackExists(trackId);
    if (!trackOk) return res.sendStatus(400);

    const alreadyAdded = await trackInPlaylist(playlistId, trackId);
    if (alreadyAdded) return res.sendStatus(400);

    const added = await addTrackToPlaylist(playlistId, trackId);
    res.status(201).json(added);
  } catch (err) {
    next(err);
  }
});

// DELETE /playlists/:id/tracks/:trackId
router.delete("/:id/tracks/:trackId", async (req, res, next) => {
  const playlistId = Number(req.params.id);
  const trackId = Number(req.params.trackId);

  if (isNaN(playlistId) || isNaN(trackId)) return res.sendStatus(400);

  try {
    const inPlaylist = await trackInPlaylist(playlistId, trackId);
    if (!inPlaylist) return res.sendStatus(404);

    await removeTrackFromPlaylist(playlistId, trackId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
