import { io } from "socket.io-client";

const socket = io({
    path: "/api/chats",
    autoConnect: false, // we connect manually
    transports: ["websocket", "polling"],
});

export default socket;
