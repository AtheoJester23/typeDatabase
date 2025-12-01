import express from "express";
import {
  createNewCustom,
  getAllUserCustoms,
} from "../controllers/customController.js";

const router = express.Router();

router.get("/", getAllUserCustoms);

router.post("/create", createNewCustom);

export default router;
