import { promises as dnsPromises } from "node:dns";
dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import dotenv from "dotenv";
import "dotenv/config";
import connect from "./config/db.config.js";
import Userrouter from "./routes/user.routes.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import voteRouter from "./Routes/vote.route.js";
import reportRouter from "./Routes/report.route.js";
import followRouter from "./Routes/follow.route.js";
import adminRouter from "./Routes/admin.route.js";
import messageRouter from "./Routes/message.routes.js";

import { app, server } from "./socket/socket.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", Userrouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/vote", voteRouter);
app.use("/api/report", reportRouter);
app.use("/api/follow", followRouter);
app.use("/api/admin", adminRouter);
app.use("/api/message", messageRouter);

server.listen(process.env.PORT, () => {
  connect()
    .then(() => {
      console.log(
        `⚙️  Server and WebSockets started cleanly at port: ${process.env.PORT}`,
      );
    })
    .catch((err) => {
      console.log(`❌ Server start failed:`, err.message);
    });
});
