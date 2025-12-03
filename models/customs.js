import mongoose from "mongoose";

const customSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collections",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Customs", customSchema);
