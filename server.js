import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

//dotenv configuration:
dotenv.config();
const PORT = process.env.PORT;
const DATABASE = process.env.MONG_URI;

//Express:
const app = express();

//middlewares:
app.use(express.json());

//routes:
app.get("/", (req, res) => {
  res.status(200).send(`<h1>Welcome to Type_Database</h1>`);
});

//404 handler:
app.use((req, res, next) => {
  res.status(404).json({
    message: "This API link does not exist",
  });
});

//mongoose connection:
mongoose
  .connect(DATABASE)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Started at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err.messages);
  });
