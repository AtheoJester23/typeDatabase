import bcrypt from "bcrypt";
import validator from "validator";
import Users from "../models/users.js";
import jwt from "jsonwebtoken";

//login:
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    //Exclude password from response:
    const { password: _, ...data } = user.toObject();

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
