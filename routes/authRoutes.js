import express from "express";
import {
  forgotPass,
  fp,
  logout,
  refresh,
  userLogin,
} from "../controllers/authController.js";

const router = express.Router();

//Forgot Password(Manual):
router.post("/forgotPassword1", fp);

//Forgot Password(RSND):
router.post("/forgotPassword", forgotPass);

//Login:
router.post("/login", userLogin);

//Refresh Token:
router.post("/refresh", refresh);

//Logout:
router.post("/logout", logout);

export default router;
