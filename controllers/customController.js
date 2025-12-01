import Customs from "../models/customs.js";

export const createNewCustom = async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ message: "All inputs are required." });
    }

    const customDetails = new Customs({
      title,
      content,
      userId,
    });

    const createCustom = customDetails.save();

    //response:
    res.status(200).json({
      message: "New custom created successfully",
      customDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserCustoms = async (req, res) => {
  try {
    const { userId } = req.body;

    const allCustoms = await Customs.find({ userId }).sort({
      createdAt: -1,
    });
    if (allCustoms.length === 0) {
      return res.status(404).json({ message: "No custom texts yet." });
    }

    res.status(200).json(allCustoms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
