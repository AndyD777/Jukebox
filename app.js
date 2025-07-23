import express from "express";
import tracksRouter from "./routes/tracks.js";
import playlistsRouter from "./routes/playlists.js";

const app = express();

app.use(express.json()); // <-- This must be added here!

app.use("/tracks", tracksRouter);
app.use("/playlists", playlistsRouter);

export default app;
