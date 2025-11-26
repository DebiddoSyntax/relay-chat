import { Server } from "socket.io";
import type { NextRequest } from "next/server";

let io: Server | null = null;

export async function GET(request: NextRequest) {
    const server: any = (request as any)?.socket?.server || (request as any)?.req?.socket?.server;

    if (!server) {
        return new Response("Server not ready", { status: 500 });
    }

    if (!io) {
        if (!server.io) {
            const ioServer = new Server(server, {
                path: "/api/chats",
                cors: { origin: "*" },
            });

            server.io = ioServer;

            ioServer.on("connection", (socket) => {
                console.log("User connected");

                socket.on("send-message", (msg) => {
                    ioServer.emit("receive-message", msg);
                });

                socket.on("disconnect", () => {
                    console.log("User disconnected");
                });
            });
        }

        io = server.io;
    }

    return new Response("Socket server ready", { status: 200 });
}
