import express from "express";
import cookieParser from "cookie-parser";
import connectDb from "./DB/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";
import lawyerRouter from "./routes/lawyerRoute.js";
import gigRouter from "./routes/gigRoute.js";
import conversationRoute from "./routes/conversation.js";
import clientCaseRouter from "./routes/clientPostRoute.js";
import messageRoute from "./routes/messageRoute.js";
import documentRoute from "./routes/documentRoute.js";
import bidRouter from "./routes/bidRoute.js";
import verificationRouter from "./routes/verificationRoute.js";
import customerSupport from "./routes/supportRoute.js";
// import documentRouter from "./routes/documentRoute.js"
import cors from "cors";
import { Server } from "socket.io";
import { app, server, io } from "./socket/socket.js";
import { errorMiddlerware } from "./middleware/error.js";
import bodyParser from "body-parser";
// import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";

// require("dotenv").config();
// process.on("uncaughtException", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Uncaught Exception`);
//   process.exit(1);
// });
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload());
app.use(express.json());

const db = process.env.db as string;

app.set("io", io);
app.use("/api/user", userRouter);
app.use("/api/lawyer", lawyerRouter);
app.use("/api/gig", gigRouter);
app.use("/api/job", clientCaseRouter);
app.use("/api/conversation", conversationRoute);
app.use("/api/message", messageRoute);
app.use("/api/bid", bidRouter);
app.use("/api/verification", verificationRouter);
app.use("/api/document", documentRoute);
app.use("/api/customer-support", customerSupport);
// app.use("/api/document", documentRouter);
const port = process.env.PORT || 4000;

app.use(errorMiddlerware);
connectDb(db)
  .then(() => {
    console.log("Database connected");
    server.listen(port, () => {
      console.log(`Server is running ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

// process.on("unhandledRejection", (err:any) => {

//   console.log(`Error: ${err.message}`);

//   console.log(`Shutting down the server due to Unhandled Promise Rejection`);

//   server.close(() => {
//     process.exit(1);
//   });
// });
