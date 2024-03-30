import express from "express";
import cookieParser from "cookie-parser";
import connectDb from "./DB/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";
import lawyerRouter from "./routes/lawyerRoute.js";
import gigRouter from "./routes/gigRoute.js";
import clientCaseRouter from "./routes/caseRoute.js";
import cors from "cors";
import { Server } from "socket.io";
import { app, server } from "./socket/socket.js";
import { errorMiddlerware } from "./middleware/error.js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
// require("dotenv").config();
// process.on("uncaughtException", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the server due to Uncaught Exception`);
//   process.exit(1);
// });
dotenv.config();
const io = new Server(server);
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());



app.use(express.json());

const db = process.env.db as string;
connectDb(db);

app.use("/api/user", userRouter);
app.use("/api/lawyer", lawyerRouter);
app.use("/api/gig", gigRouter);
app.use("/api/case", clientCaseRouter);
io.on("connection", (socket) => {
  console.log("a user connected");
});
const port = process.env.PORT || 4000;

app.use(errorMiddlerware);

server.listen(port, () => {
  console.log(`Server is running ${port}`);
});

// process.on("unhandledRejection", (err:any) => {


//   console.log(`Error: ${err.message}`);

//   console.log(`Shutting down the server due to Unhandled Promise Rejection`);

//   server.close(() => {
//     process.exit(1);
//   });
// });
