import express from "express";
import {
  createNewCustom,
  getAllUserCustoms,
  usersCollection,
} from "../controllers/customController.js";

const router = express.Router();

router.get("/", getAllUserCustoms);

router.get("/userCollections", usersCollection);

router.post("/create", createNewCustom);

export default router;
