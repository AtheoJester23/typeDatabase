import express from "express";
import {
  createNewCustom,
  deleteCustom,
  deleteTopic,
  getAllUserCustoms,
  getATopic,
  getCollectionNames,
  updateATopic,
  usersCollection,
} from "../controllers/customController.js";
import { getUserById } from "../middlewares/getUserById.js";

const router = express.Router();

router.post("/create", createNewCustom);

router.get("/", getAllUserCustoms);

//get specific topic:
router.get("/topic/:id", getATopic);

router.patch("/topic/:id", updateATopic);

router.get("/userCollections/:id", getUserById, usersCollection);

router.get("/userCollectionNames/:id", getUserById, getCollectionNames);

router.delete("/delete/:id", deleteCustom);

router.delete("/deleteTopic/:id", deleteTopic);
export default router;
