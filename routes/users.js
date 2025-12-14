import express from "express";
import {
  createUser,
  delUser,
  getAllUsers,
  getAUser,
  updateUser,
} from "../controllers/usersController.js";
import { getUserById } from "../middlewares/getUserById.js";
import { deleteAllContentsOfUser } from "../controllers/customController.js";

const router = express.Router();

//POST Request:
router.post("/", createUser);

//GET All Users:
router.get("/", getAllUsers);

//GET Specific User:
router.get("/:id", getUserById, getAUser);

//UPDATE User Details:
router.patch("/:id", getUserById, updateUser);

//DELETE User:
router.delete("/:id", getUserById, delUser, deleteAllContentsOfUser);

export default router;
