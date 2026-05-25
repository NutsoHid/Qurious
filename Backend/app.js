//windows network issue ig
import { promises as dnsPromises } from "node:dns";
// Explicitly force Node.js to use Cloudflare and Google DNS for its internal lookups
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import dotenv from "dotenv";
import "dotenv/config";
import connect from "./config/db.config.js";
import Userrouter from "./routes/user.routes.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./Routes/comment.route.js";
import voteRouter from "./Routes/vote.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", Userrouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/vote", voteRouter);

app.listen(process.env.PORT, (req, res) => {
  connect()
    .then(() => {
      console.log(`Server started at ${process.env.PORT}`);
    })
    .catch(() => {
      console.log(`Server start failed`);
    });
});
