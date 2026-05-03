import express from "express";
import dotenv from "dotenv";
import "dotenv/config";
import connect from "./config/db.config.js";
import Userrouter from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", Userrouter);

app.listen(process.env.PORT, (req, res) => {
  connect()
    .then(() => {
      console.log(`Server started at ${process.env.PORT}`);
    })
    .catch(() => {
      console.log(`Server start failed`);
    });
});
