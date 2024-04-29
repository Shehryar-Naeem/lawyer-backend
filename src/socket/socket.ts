import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messages/message.js";
import Conversation from "../models/conversation/conversation.js";
import { log } from "console";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin:[
      "http://localhost:3000",
      "http://localhost:3001",
      "https://lawyer-market.vercel.app",
    
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
const userSocketMap: any = {}; // userId: socketId

export const getRecipientSocketId = (recipientId: string) => {
  return userSocketMap[recipientId];
};

io.on("connection", (socket) => {
  console.log("Connected to socket", socket.handshake.query._id);
  const userId: any = socket.handshake.query._id;

  if (userId) {
    // Store the user's socket ID in the map
    userSocketMap[userId] = socket.id;

    // Emit the list of online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
  

  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
		try {
			await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
			await Conversation.updateOne({ _id: conversationId }, { $set: { "latestMessage.seen": true } });
			io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
		} catch (error) {
			console.log(error);
		}
	});
  socket.on("disconnect", () => {
    console.log("Disconnected from socket");
    if (userId && userSocketMap[userId]) {
      // Remove the user's socket ID from the map
      delete userSocketMap[userId];

      // Emit the updated list of online users to all clients
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, server, app };
