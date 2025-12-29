import validator from "validator";
import { emailSend } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import Users from "../models/users.js";
import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { Resend } from "resend";
import crypto from "crypto";
import { appendFile } from "fs";

//login:
export const userLogin = async (req, res) => {
  try {
    let { email, password, rememberMe } = req.body;

    rememberMe = Boolean(rememberMe);
    email = email.toLocaleLowerCase();

    if (!password || !email) {
      return res.status(400).json({ message: "Missing inputs" });
    }

    //Validate Email:
    if (!validator.isEmail(email) || email.replace(/[ ]/g, "") == "") {
      return res.status(400).json({ message: "Invalid email address" });
    }

    //Find User:
    const user = await Users.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "That user does not exist" });
    }

    //Authenticate User Password:
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || password.replace(/[ ]/g, "") == "") {
      return res.status(401).json({ message: "Wrong password" });
    }

    //Generate JWT:
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    const refreshToken = signRefreshToken(user);

    //Exclude password from response:
    const { password: _, ...data } = user.toObject();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    //response:
    res.status(200).json({
      message: "Logged in successfully",
      data,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Refresh token:
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No cookie found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await Users.findOne({ _id: decoded.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Generate new access token:
    const accessToken = signAccessToken(user);

    res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

//logout:
export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Forgot Password(Manual):
export const fp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
    }

    //Validate Email:
    const isValid = validator.isEmail(email);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const isExisting = await Users.findOne({ email });
    if (!isExisting) {
      return res
        .status(404)
        .json({ message: "Email does not exist in the database" });
    }

    await emailSend(email, `This is a testing message again...`);

    res.status(200).json({ message: "Email sent..." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resend = new Resend(process.env.RSND_API);
const FRONTEND_URL = process.env.FRNTND_LOCAL;

//Forgot Password(Resend):
export const forgotPass = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.replace(/[ ]/g, "") == "") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    //validate email:
    const isValid = validator.isEmail(email);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    //Generate random token:
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    user.password_reset_token_hash = tokenHash;
    user.password_reset_expires_at = Date.now() + 1000 * 60 * 15;

    //Save updated things for reset password:
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    const result = await resend.emails.send({
      from: "no-reply@atheo.site",
      to: [email],
      subject: "Reset your password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//Reset Password:
export const resetPass = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!newPassword || newPassword.replace(/[ ]/g, "") == "") {
      return res.status(402).json({ message: "Please enter a new password" });
    }

    if (!token || token.replace(/[ ]/g, "") == "") {
      return res.status(401).json({ message: "Invalid or expired reset link" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Users.findOne({
      password_reset_token_hash: tokenHash,
      password_reset_expires_at: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    //new Password:
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.password_reset_token_hash = null;
    user.password_reset_expires_at = null;

    //Save updates:
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
