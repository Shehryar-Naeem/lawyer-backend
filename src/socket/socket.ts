import { Server } from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,     
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

export { io, server, app };