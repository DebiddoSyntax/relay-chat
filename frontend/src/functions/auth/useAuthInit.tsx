"use client";
import { useAuth } from "./Store";
import { useEffect, useRef } from "react";
import { areInterceptorsActive, EjectInterceptors, InitializedInterceptor } from "@/src/functions/auth/AxiosConfig";
import { usePathname } from "next/navigation";
import { useChat } from "../chats/chatStore";


export default function AuthInit() {
    const { accessToken, authInitialized, refreshAccessToken } = useAuth();

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
    
    const pathname = usePathname()
    const setActiveId = useChat((state)=> state.setActiveId)
    const setChatOpen = useChat((state)=> state.setChatOpen)

    useEffect(()=> {
        setActiveId(null)
        setChatOpen(false)
    }, [pathname])


    return null
}
