// pages/api/chat.ts

import { Server } from "socket.io";

export default function handler(req: any, res: any) {
    // If Socket.io is already running, do nothing
    if (!res.socket.server.io) {
        console.log("Starting Socket.io server...");

        const io = new Server(res.socket.server, {
            path: "/api/chat",
            cors: {
                origin: "*",
            },
        });

        res.socket.server.io = io;

        io.on("connection", (socket) => {
            console.log("User connected");

            socket.on("send-message", (msg) => {
                io.emit("receive-message", msg);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });
        });
    } else {
        console.log("Socket.io already running");
    }

    res.end("Socket server ready");
}
