import mongoose from "mongoose";
import validator from "validator";

const usersSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Invalid Email Address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Users", usersSchema);
