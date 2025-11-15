import Users from "../models/users.js";

export const getUserById = async (req, res, next) => {
  let retrievedData;

  try {
    retrievedData = await Users.findById(req.params.id).select("+password");
    if (!retrievedData) {
      return res.status(404).json({ message: "This User Does Not Exist." });
    }

    req.user = retrievedData;
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  next();
};
