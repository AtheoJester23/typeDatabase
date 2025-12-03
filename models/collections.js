import mongoose from "mongoose";

const collectionsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Collections", collectionsSchema);
