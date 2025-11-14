import Users from "../models/users.js";
import validator from "validator";
import bcrypt from "bcrypt";

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
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//POST Request:
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name ||
      name.replace(/[ ]/g, "") == "" ||
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
      name,
      email,
      password: hashedPassword,
    });

    //Add new User to Database:
    const createNewUser = await userDetails.save();

    //Exclude Password from response:
    const { password: _, ...data } = createNewUser.toObject();

    //Response:
    res.status(200).json({
      message: "New User Created Successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
