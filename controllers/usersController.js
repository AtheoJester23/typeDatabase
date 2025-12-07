import Users from "../models/users.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await Users.find();

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET Specific User:
export const getAUser = async (req, res) => {
  try {
    //Exclude Password:
    const { password: _, ...data } = req.user.toObject();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//POST Request:
export const createUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    email = email.toLocaleLowerCase();

    if (
      !username ||
      username.replace(/[ ]/g, "") == "" ||
      !email ||
      email.replace(/[ ]/g, "") == "" ||
      !password ||
      password.replace(/[ ]/g, "") == ""
    ) {
      return res.status(400).json({ message: "All Inputs are required..." });
    }

    //Check if user already exists:
    const theUser = await Users.findOne({ email });
    if (theUser) {
      return res.status(409).json({ message: "That user already exists..." });
    }

    // console.log(`This is the _id: ${theUser._id}`);

    //Validate Email Address:
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ message: "The inputted Email Address is Invalid" });
    }

    //Encrypt Password:
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //User Details:
    const userDetails = new Users({
      username,
      email,
      password: hashedPassword,
    });

    //Add new User to Database:
    const createNewUser = await userDetails.save();

    //Exclude Password from response:
    const { password: _, ...data } = createNewUser.toObject();

    //Create JWT:
    const token = jwt.sign({ id: data._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    //Response:
    res.status(200).json({
      message: "New User Created Successfully",
      data,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update:
export const updateUser = async (req, res) => {
  try {
    const { username, email, password, oldPassword } = req.body;

    if (!oldPassword) {
      return res.status(401).json({ message: "Failed to authenticate" });
    }

    //Authenticate User:
    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong Password" });
    }

    if (username) {
      if (username.replace(/[ ]/g, "") == "") {
        return res.status(400).json({ message: "Invalid username" });
      }

      req.user.username = username;
    }

    if (email) {
      //Validate Email:
      if (!validator.isEmail(email) || email.replace(/[ ]/g, "") == "") {
        return res.status(400).json({ message: "Invalid Email Address" });
      }

      req.user.email = email;
    }

    if (password) {
      if (password.replace(/[ ]/g, "") == "") {
        return res.status(400).json({ message: "Invalid Password" });
      }

      //Encrypt Password
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(password, saltRounds);

      req.user.password = hashPassword;
    }

    //Save the Update:
    const saveUpdate = await req.user.save();

    //Exclude password
    const { password: _, ...data } = saveUpdate.toObject();

    //The Response:
    res.status(200).json({
      messsage: "User Successfully Updated",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE User:
export const delUser = async (req, res) => {
  try {
    await req.user.deleteOne();

    //Response:
    res.status(200).json({
      message: "Account successfully deleted.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
