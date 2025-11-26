"use client"
import React, { useEffect, useState } from 'react'
import socket from '@/src/functions/data/chats/socket'
import axios from 'axios';


export default function Chats() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // axios.get("http://localhost:3000/api/chats");
        fetch("/api/chat");

        socket.connect();

        socket.on("receive-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("receive-message");
            socket.disconnect();
        };

    }, []);

    function sendMessage() {
        if (!message.trim()) return;
        socket.emit("send-message", message);
        setMessage("");
    }

    return (
        <div style={{ padding: 20 }}>
            <div>
                {messages.map((m, i) => (
                    <p key={i}>{m}</p>
                ))}
            </div>

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message"
                style={{ border: "1px solid #ccc", padding: 8 }}
            />

            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

