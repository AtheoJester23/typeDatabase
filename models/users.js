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
    personalRecord: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      select: false,
    },
    password_reset_token_hash: {
      type: String,
    },
    password_reset_expires_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Users", usersSchema);
