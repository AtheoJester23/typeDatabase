import express from "express";
import {
  createNewCustom,
  deleteCustom,
  getAllUserCustoms,
  getCollectionNames,
  usersCollection,
} from "../controllers/customController.js";
import { getUserById } from "../middlewares/getUserById.js";

const router = express.Router();

router.post("/create", createNewCustom);

router.get("/", getAllUserCustoms);

router.get("/userCollections/:id", getUserById, usersCollection);

router.get("/userCollectionNames/:id", getUserById, getCollectionNames);

router.delete("/delete/:id", deleteCustom);
export default router;
