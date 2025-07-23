import express from "express";
import { getAllTracks, getTrackById } from "#db/queries";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const tracks = await getAllTracks();
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.sendStatus(400);

  try {
    const track = await getTrackById(id);
    if (!track) return res.sendStatus(404);
    res.json(track);
  } catch (err) {
    next(err);
  }
});

export default router;
