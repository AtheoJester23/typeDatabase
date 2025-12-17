import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

//import routers:
import usersRouter from "./routes/users.js";
import authRouter from "./routes/authRoutes.js";
import customRouter from "./routes/custom.js";

//dotenv configuration:
dotenv.config();
const PORT = process.env.PORT;
const DATABASE = process.env.MONG_URI;

//Express:
const app = express();

//cors:
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//mongoose connection:
mongoose
  .connect(DATABASE)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Started at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

//middlewares:
app.use(express.json());

//routes:
app.get("/", (req, res) => {
  res.status(200).send(`<h1>Welcome to Type_Database</h1>`);
});
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/custom", customRouter);

//404 handler:
app.use((req, res, next) => {
  res.status(404).json({
    message: "This API link does not exist",
  });
});
