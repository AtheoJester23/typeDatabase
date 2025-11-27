import express from "express";
import { fp, userLogin } from "../controllers/authController.js";

const router = express.Router();

//Forgot Password:
router.post("/forgotPassword", fp);

//Login:
router.post("/login", userLogin);

export default router;
