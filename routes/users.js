import express from "express";
import { getAllUsers } from "../controllers/usersController.js";

const router = express.Router();

//GET All Users
router.get("/", getAllUsers);

export default router;
