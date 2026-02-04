"use client";
import { useAuth } from "../auth/Store";
import { useEffect, useRef } from "react";
import { areInterceptorsActive, EjectInterceptors, InitializedInterceptor } from "@/src/functions/auth/AxiosConfig";
import { usePathname } from "next/navigation";
import { useChat } from "../chats/chatStore";


export default function AuthInit() {
    const accessToken = useAuth((state)=> state.accessToken);
    const refreshAccessToken = useAuth((state)=> state.refreshAccessToken);
    const authInitialized = useAuth((state)=> state.authInitialized);

    const setChatOpen = useChat((state)=> state.setChatOpen)
    // const setPrivateChats = useChat((state)=> state.setPrivateChats)
    // const setGroupChats = useChat((state)=> state.setGroupChats)
    // const setAiChatId = useChat((state)=> state.setAiChatId)
    const setActivePrivateId = useChat((state)=> state.setActivePrivateId)
    const setActiveGroupId = useChat((state)=> state.setActiveGroupId)

    const pathname = usePathname()

    const refreshRef = useRef(refreshAccessToken);

    useEffect(() => {
        refreshRef.current = refreshAccessToken;
    }, [refreshAccessToken]);

    useEffect(() => {
        if (accessToken) {
            InitializedInterceptor(refreshRef.current);
        }

        useAuth.setState({ authInitialized: true });

        return () => {
            EjectInterceptors();
        };
    }, []);


    useEffect(() => {
        if (authInitialized && accessToken) {
            if (!areInterceptorsActive()) {
                InitializedInterceptor(refreshRef.current);
            }
        }
    }, [accessToken, authInitialized]);
    

    useEffect(()=> {
        setChatOpen(false)
        setActiveGroupId(null)
        setActivePrivateId(null)
        // setAiChatId(null)
        // setGroupChats([])
        // setPrivateChats([])
    }, [pathname])


    return null
}
