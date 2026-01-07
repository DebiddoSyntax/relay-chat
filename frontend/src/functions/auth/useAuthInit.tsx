"use client";
import { useAuth } from "./Store";
import { useEffect, useRef } from "react";
import { areInterceptorsActive, EjectInterceptors, InitializedInterceptor } from "@/src/functions/auth/AxiosConfig";


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


    return null
}
