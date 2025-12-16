import express from "express";
import {
  fp,
  logout,
  refresh,
  userLogin,
} from "../controllers/authController.js";

const router = express.Router();

//Forgot Password:
router.post("/forgotPassword", fp);

//Login:
router.post("/login", userLogin);

//Refresh Token:
router.post("/refresh", refresh);

//Logout:
router.post("/logout", logout);

export default router;
