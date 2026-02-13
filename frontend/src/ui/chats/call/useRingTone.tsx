import { useChat } from "@/src/functions/chats/chatStore";
import { useEffect, useRef } from "react";

export default function useRingTone() {
    const incomingCall = useChat((state)=> state.incomingCall)
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("/ringtone.mp3");
        audioRef.current.loop = true;
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;

        if (incomingCall?.isCalling) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [incomingCall]);

    return null;
}
