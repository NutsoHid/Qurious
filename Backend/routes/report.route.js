import express from "express";
import {
  createReport,
  getReport,
  editReport,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const reportRouter = express.Router();

reportRouter.post("/submit/:type/:typeId", verifyJWT, createReport);
reportRouter.get("/view/:reportId", verifyJWT, getReport);
reportRouter.put("/edit/:reportId", verifyJWT, editReport);

export default reportRouter;
