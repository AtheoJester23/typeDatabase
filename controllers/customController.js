import Customs from "../models/customs.js";
import Collections from "../models/collections.js";
import Users from "../models/users.js";
import jwt from "jsonwebtoken";

export const createNewCustom = async (req, res) => {
  try {
    const { userId, title, content, collectionId, collectionName } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ message: "All inputs are required." });
    }

    let finalCollectionsId = collectionId;
    let finalCollectionsName = null;

    //If no add to existing collection or create new collection:
    if (!collectionName && !collectionId) {
      return res.status(400).json({ message: "All inputs are required." });
    }

    //If the user opt to create a new collections instead;
    if (collectionName) {
      const exist = await Collections.findOne({ name: collectionName, userId });
      if (exist) {
        return res.status(409).json({ message: "Collection already exists." });
      }

      const createNewCollection = await Collections.create({
        name: collectionName,
        userId,
      });

      finalCollectionsId = createNewCollection._id;
      finalCollectionsName = collectionName;
    }

    //If the user opt to add a content to an existing collections
    if (collectionId) {
      const existing = await Collections.findById(collectionId);
      if (!existing) {
        return res.status(404).json({ message: "Collection not found." });
      }

      finalCollectionsName = existing.name;
    }

    //Append the new content:
    const customDetails = await Customs.create({
      title,
      content,
      userId,
      collectionName: finalCollectionsName,
      collectionId: finalCollectionsId,
    });

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

//Get specific user's collections:
export const usersCollection = async (req, res) => {
  try {
    //Check if that userId exist:
    const exist = await Users.findById({ _id: req.params.id });
    if (!exist) {
      return res.status(404).json({ message: "User not found." });
    }

    //Get all the user's collection:
    const allCollection = await Customs.find({ userId: req.params.id });
    if (!allCollection) {
      return res.status(404).json({ message: "No collection found." });
    }

    //response:
    res.status(200).json({
      data: allCollection,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCollectionNames = async (req, res) => {
  try {
    const collectionNames = await Collections.find({ userId: req.params.id });

    res.status(200).json(collectionNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustom = async (req, res) => {
  try {
    const { collectionId } = req.body;
    const { id } = req.params;

    // Delete the collection first
    const deleteResult = await Collections.deleteOne({
      userId: id,
      _id: collectionId,
    });

    // If it didn't delete anything, collection was not found
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Collection not found." });
    }

    // Delete all customs linked to this collection
    await Customs.deleteMany({
      userId: id,
      collectionId,
    });

    // Get remaining collections for the user EXCEPT the deleted one
    const remainingCollections = await Collections.find({
      userId: id,
      _id: { $ne: collectionId }, // <--- not equal
    });

    res.status(200).json({
      message: "Collection and its contents deleted successfully.",
      remainingCollections,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllContentsOfUser = async (req, res) => {
  try {
    const { id } = req.params;

    //Delete all collections linked to this user
    await Collections.deleteMany({ userId: id });

    //Delete all customs linked to this user
    await Customs.deleteMany({ userId: id });

    res.status(200).json({
      message: "All user data deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getATopic = async (req, res) => {
  try {
    const topic = await Customs.findOne({ _id: req.params.id });
    if (!topic) {
      return res.status(404).json({ message: "Topic not found." });
    }

    res.status(200).json({ data: topic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateATopic = async (req, res) => {
  try {
    const { title, content } = req.body;
    const refToken = req.cookies.refreshToken;

    if (!refToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    //verify token:
    jwt.verify(
      refToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        //find user:
        const user = await Users.findOne({ id: decoded._id });
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        //Get the topic:
        const topic = await Customs.findOne({ _id: req.params.id });
        if (!topic) {
          return res.status(404).json({ message: "Topic not found" });
        }

        if (title && title.replace(/[ ]/g, "") !== "") {
          topic.title = title;
        }

        if (content && content.replace(/[ ]/g, "") !== "") {
          topic.content = content;
        }

        // //Actual update:
        await topic.save();

        //response:
        res.status(200).json({ message: topic });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const topic = await Customs.findOne({ _id: req.params.id });
    if (!topic) {
      return res.status(404).json({ message: "Topic not found." });
    }

    //Delete topic from database
    const deletion = await topic.deleteOne();

    res.status(200).json({
      message: "Topic deleted succesfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
