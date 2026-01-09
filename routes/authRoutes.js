import express from "express";
import {
  forgotPass,
  fp,
  logout,
  refreshPage,
  resetPass,
  userLogin,
} from "../controllers/authController.js";

const router = express.Router();

//Forgot Password(Manual):
router.post("/forgotPassword1", fp);

//Forgot Password(RSND):
router.post("/forgotPassword", forgotPass);

//Reset Password:
router.post("/resetPassword", resetPass);

//Login:
router.post("/login", userLogin);

//Refresh Token:
router.post("/refresh", refreshPage);

//Logout:
router.post("/logout", logout);

export default router;
