import express from "express";
import { getAllUsers, getAUser } from "../controllers/usersController.js";
import { getUserById } from "../middlewares/getUserById.js";

const router = express.Router();

//GET All Users:
router.get("/", getAllUsers);

//GET Specific User:
router.get("/:id", getUserById, getAUser);

export default router;
