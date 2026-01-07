"use client"
import { useEffect, useRef, useState } from "react";


interface MessageType {
    id: number,
    sender: { email: string },
    content: string
}

export default function TestChat() {
    const socketRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("connecting");
    const chatId = "f6f372eb-cc56-43c7-a4b4-b3808448d44b"
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY3MTUyMDQ4LCJpYXQiOjE3NjY5Njc2OTEsImp0aSI6ImMwMzU0MzZmN2NlZTRmMTU4MjQ0YzJjNTllMDdkYTgwIiwidXNlcl9pZCI6ImJkYjZhN2FmLWIyOWUtNDE4YS1iODJhLWM0MDM4ZWMwNzU0NCJ9.Badv5EO7eknCNxE7eU02eDn27P4vFxa6pl_ykhWmLfg"
    // const token = localStorage.getItem('accessToken');

    useEffect(() => {
        const wsUrl = `ws://localhost:8000/ws/chat/${chatId}/?token=${token}`;
        const socket = new WebSocket(wsUrl);

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setStatus("connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "connection") {
                console.log("Connected:", data);
            }

            if (data.type === "message") {
                setMessages((prev) => [...prev, data]);

                // Send read receipt
                socket.send(
                    JSON.stringify({
                        type: "read",
                        message_id: data.id,
                    })
                );
            }

            if (data.type === "read") {
                console.log("Message read:", data);
            }

            if (data.type === "error") {
                console.error(data.error);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
            setStatus("disconnected");
        };

        socket.onerror = (err) => {
            console.error("WebSocket error", err);
        };

        return () => socket.close();
    }, [chatId, token]);

    const sendMessage = () => {
        if (!input.trim()) return;

        socketRef.current?.send(
            JSON.stringify({
                type: "message",
                content: input,
                message_type: "text",
            })
        );

        setInput("");
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h3>Chat ({status})</h3>

                <div
                    style={{
                        border: "1px solid #ccc",
                        padding: 10,
                        height: 300,
                        overflowY: "auto",
                        marginBottom: 10,
                    }}
                >
                    {messages.map((msg) => (
                        <div key={msg.id} style={{ marginBottom: 6 }}>
                            <strong>{msg.sender.email}:</strong> {msg.content}
                        </div>
                    ))}
                </div>

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message"
                    style={{ width: "100%", padding: 8 }}
                />
        </div>
    );
}
